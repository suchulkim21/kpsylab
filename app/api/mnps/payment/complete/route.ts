/**
 * MNPS 결제 완료: PG사(Stripe) 위변조 검증 후 is_paid 업데이트
 * POST body: { paymentId (Stripe session_id), assessmentId }
 * - paymentId로 Stripe Checkout Session 조회 → payment_status, amount_total, metadata 검증
 * - 검증 성공 시 supabaseAdmin으로 assessments.is_paid = true (RLS 우회)
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

const MNPS_AMOUNT = Number(process.env.STRIPE_MNPS_AMOUNT) || 9900;
const MNPS_CURRENCY = (process.env.STRIPE_MNPS_CURRENCY || 'krw').toLowerCase();

export async function POST(request: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe not configured', code: 'STRIPE_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const paymentId = body.paymentId ?? body.session_id;
    const assessmentId = body.assessmentId;

    if (!paymentId || !assessmentId || typeof assessmentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'paymentId and assessmentId required', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(paymentId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed', code: 'PAYMENT_NOT_PAID' },
        { status: 400 }
      );
    }

    const amountTotal = session.amount_total ?? 0;
    const currency = (session.currency ?? '').toLowerCase();
    if (amountTotal !== MNPS_AMOUNT || currency !== MNPS_CURRENCY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment amount mismatch',
          code: 'AMOUNT_MISMATCH',
          expected: { amount: MNPS_AMOUNT, currency: MNPS_CURRENCY },
          received: { amount: amountTotal, currency },
        },
        { status: 400 }
      );
    }

    const metaAssessmentId = session.metadata?.assessmentId;
    if (metaAssessmentId !== assessmentId) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID mismatch', code: 'ASSESSMENT_MISMATCH' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured (Service Role required)', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('assessments')
      .update({ is_paid: true })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('MNPS payment complete: update is_paid failed', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isPaid: true,
    });
  } catch (e) {
    console.error('MNPS payment/complete error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
