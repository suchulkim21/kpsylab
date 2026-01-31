/**
 * MNPS 결제: Stripe Checkout Session 생성
 * POST body: { assessmentId }
 * 반환: { url } — 클라이언트에서 redirect(url) 호출
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin, supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

const MNPS_AMOUNT = Number(process.env.STRIPE_MNPS_AMOUNT) || 9900; // KRW (또는 USD cents 등, STRIPE_MNPS_CURRENCY와 일치)
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
    const { assessmentId } = body;

    if (!assessmentId || typeof assessmentId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'assessmentId required', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const db = supabaseAdmin ?? supabase;
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { data: assessment, error: assessError } = await db
      .from('assessments')
      .select('id, status, is_paid')
      .eq('id', assessmentId)
      .single();

    if (assessError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Assessment not completed', code: 'INVALID_STATE' },
        { status: 400 }
      );
    }

    if (assessment.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Already paid', code: 'ALREADY_PAID' },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:7777');
    const successUrl = `${baseUrl}/mnps/result?assessmentId=${encodeURIComponent(assessmentId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/mnps/result?assessmentId=${encodeURIComponent(assessmentId)}`;

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: MNPS_CURRENCY,
            unit_amount: MNPS_AMOUNT,
            product_data: {
              name: 'MNPS: Dark Nature Test - Bad Report 잠금 해제',
              description: '어두운 이면(가공 없는 분석) 및 최종 리스크 시나리오 전체 공개',
              images: [],
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        assessmentId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout URL', code: 'STRIPE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (e) {
    console.error('MNPS create-checkout error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
