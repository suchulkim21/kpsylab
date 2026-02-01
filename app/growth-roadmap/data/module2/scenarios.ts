import { Scenario } from "@growth-roadmap/types/module2";

export const SCENARIOS: Scenario[] = [
    // Theme 1: Stimulus Control (자극 통제) - 9 items
    {
        id: "SC_STIM_1",
        situation: "경쟁 팀의 발표 자료에서 치명적인 오류를 발견했습니다.",
        options: [
            { id: "OP_inh_1", text: "발표가 끝난 후 따로 보고한다.", type: "thinking", weight: { proactivity: 5, socialDistance: 5, adaptability: 5 } },
            { id: "OP_act_1", text: "그 자리에서 즉시 지적한다.", type: "acting", weight: { proactivity: 10, socialDistance: 10, adaptability: -5 } },
            { id: "OP_ign_1", text: "일단 모른 척 넘어간다.", type: "feeling", weight: { proactivity: -5, socialDistance: -5, adaptability: 10 } },
            { id: "OP_col_1", text: "오류를 메모해두고, 누가 먼저 발견하는지 지켜본다.", type: "thinking", weight: { proactivity: -5, socialDistance: 12, adaptability: 0 } } // 변경됨: 개입 포기 + 관찰자 위치
        ]
    },
    {
        id: "SC_STIM_2",
        situation: "회의 중 상사가 명백히 틀린 정보를 사실인 것처럼 말합니다.",
        options: [
            { id: "OP_act_2", text: "즉시 손을 들고 팩트를 정정한다.", type: "acting", weight: { proactivity: 10, socialDistance: 5, adaptability: -5 } },
            { id: "OP_inh_2", text: "일단 듣고, 나중에 근거 자료를 보낸다.", type: "thinking", weight: { proactivity: 5, socialDistance: 0, adaptability: 5 } },
            { id: "OP_ign_2", text: "분위기를 깨지 않으려 조용히 있는다.", type: "feeling", weight: { proactivity: -5, socialDistance: -5, adaptability: 10 } },
            { id: "OP_ask_2", text: "회의록에 '확인 필요'라고 표기만 해둔다.", type: "thinking", weight: { proactivity: -3, socialDistance: 10, adaptability: 0 } } // 변경됨: 개입 최소화 + 책임 회피
        ]
    },
    {
        id: "SC_STIM_3",
        situation: "경쟁사가 무리한 가격 인하로 도발을 해왔습니다.",
        options: [
            { id: "OP_act_3", text: "우리도 똑같이 가격을 내려 맞불을 놓는다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 5 } },
            { id: "OP_inh_3", text: "서비스 질을 높여 장기전으로 대응한다.", type: "thinking", weight: { proactivity: 5, adaptability: 10, socialDistance: 0 } },
            { id: "OP_fe_3", text: "기존 고객들의 이탈 여부를 먼저 살핀다.", type: "feeling", weight: { proactivity: 0, adaptability: 5, socialDistance: -5 } },
            { id: "OP_obs_3", text: "어느 쪽이든 움직이지 않고 경쟁사가 먼저 지치길 기다린다.", type: "thinking", weight: { proactivity: -8, adaptability: 5, socialDistance: 10 } } // 변경됨: 주도권 포기 + 소극적 전략
        ]
    },
    {
        id: "SC_STIM_4",
        situation: "중요한 업무 중인데 다른 부서에서 급한 협조 요청이 왔습니다.",
        options: [
            { id: "OP_act_4", text: "내 업무를 중단하고 즉시 도와준다.", type: "acting", weight: { proactivity: 5, adaptability: 10, socialDistance: -5 } },
            { id: "OP_inh_4", text: "지금은 곤란하다고 명확히 거절한다.", type: "thinking", weight: { proactivity: 5, adaptability: -5, socialDistance: 10 } },
            { id: "OP_fe_4", text: "상황을 설명하고 가능한 시간을 조율한다.", type: "thinking", weight: { proactivity: 0, adaptability: 10, socialDistance: 0 } },
            { id: "OP_del_4", text: "읽씹하고 내 업무에만 집중한다.", type: "thinking", weight: { proactivity: 0, socialDistance: 15, adaptability: -5 } } // 변경됨: 관계 단절 + 구체적 행동
        ]
    },
    {
        id: "SC_STIM_5",
        situation: "다이어트 중인데 팀 전체 회식 장소가 고기 뷔페로 잡혔습니다.",
        options: [
            { id: "OP_act_5", text: "오늘만 즐기고 내일부터 다시 시작한다.", type: "feeling", weight: { proactivity: 0, adaptability: 10, socialDistance: -5 } },
            { id: "OP_inh_5", text: "식단 조절 중이라며 적당히 먹는다.", type: "thinking", weight: { proactivity: 5, adaptability: -5, socialDistance: 5 } },
            { id: "OP_ign_5", text: "회식에 불참하거나 메뉴 변경을 건의한다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 5 } },
            { id: "OP_bal_5", text: "자리에 앉아 음료만 마시며 대화에 끼지 않는다.", type: "thinking", weight: { proactivity: -5, socialDistance: 12, adaptability: 0 } } // 변경됨: 소외 감수 + 원칙 고수
        ]
    },
    {
        id: "SC_STIM_6",
        situation: "무례한 고객이 언성을 높이며 당신을 모욕합니다.",
        options: [
            { id: "OP_act_6", text: "똑같이 언성을 높여 부당함을 따진다.", type: "acting", weight: { proactivity: 10, adaptability: -10, socialDistance: 10 } },
            { id: "OP_inh_6", text: "감정을 억누르고 매뉴얼대로 응대한다.", type: "thinking", weight: { proactivity: 0, adaptability: 10, socialDistance: 5 } },
            { id: "OP_fe_6", text: "잠시 자리를 피하고 진정할 시간을 갖는다.", type: "feeling", weight: { proactivity: -5, adaptability: 5, socialDistance: 0 } },
            { id: "OP_esc_6", text: "무표정하게 응대하고, 녹음 버튼을 누른다.", type: "thinking", weight: { proactivity: 0, socialDistance: 12, adaptability: -3 } } // 변경됨: 감정 차단 + 증거 확보
        ]
    },
    {
        id: "SC_STIM_7",
        situation: "아무도 보지 않는 서버실에 보안 등급 외 문서가 놓여 있습니다.",
        options: [
            { id: "OP_act_7", text: "호기심에 내용을 살짝 훔쳐본다.", type: "acting", weight: { proactivity: 5, adaptability: 0, socialDistance: -5 } },
            { id: "OP_inh_7", text: "즉시 보안팀에 신고하고 손대지 않는다.", type: "thinking", weight: { proactivity: 5, socialDistance: 10, adaptability: 0 } },
            { id: "OP_ign_7", text: "못 본 척하고 조용히 문을 닫는다.", type: "feeling", weight: { proactivity: -5, adaptability: 5, socialDistance: 0 } },
            { id: "OP_sec_7", text: "CCTV 위치를 확인하고, 아무 행동도 하지 않는다.", type: "thinking", weight: { proactivity: -8, socialDistance: 15, adaptability: 0 } } // 변경됨: 극단적 자기보호 + 관여 거부
        ]
    },
    {
        id: "SC_STIM_8",
        situation: "동료의 아이디어가 대박 났지만, 사실 당신이 먼저 생각했던 것입니다.",
        options: [
            { id: "OP_act_8", text: "공개적으로 내 아이디어였음을 밝힌다.", type: "acting", weight: { proactivity: 10, socialDistance: 10, adaptability: -5 } },
            { id: "OP_inh_8", text: "축하해주고 다음 기회를 노린다.", type: "feeling", weight: { proactivity: 0, socialDistance: -5, adaptability: 10 } },
            { id: "OP_ign_8", text: "따로 동료에게 이야기해 지분을 요구한다.", type: "thinking", weight: { proactivity: 5, socialDistance: 0, adaptability: 5 } },
            { id: "OP_doc_8", text: "아무 말 없이 그 동료와의 협업을 피한다.", type: "thinking", weight: { proactivity: -5, socialDistance: 15, adaptability: -5 } } // 변경됨: 관계 철수 + 은밀한 보복
        ]
    },
    {
        id: "SC_STIM_9",
        situation: "집중해서 일하는데 SNS 알림이 계속 울립니다.",
        options: [
            { id: "OP_act_9", text: "즉시 확인하고 답장을 보낸다.", type: "feeling", weight: { proactivity: 5, adaptability: 0, socialDistance: -5 } },
            { id: "OP_inh_9", text: "알림을 끄고 하던 일에 계속 집중한다.", type: "thinking", weight: { proactivity: 0, adaptability: 5, socialDistance: 5 } },
            { id: "OP_ign_9", text: "폰을 뒤집어 놓고 신경 쓰지 않으려 애쓴다.", type: "acting", weight: { proactivity: 0, adaptability: -5, socialDistance: 0 } },
            { id: "OP_sch_9", text: "폰 전원을 꺼버리고 모든 연락을 차단한다.", type: "thinking", weight: { proactivity: 0, socialDistance: 15, adaptability: -8 } } // 변경됨: 극단적 단절 + 사회적 비용
        ]
    },

    // Theme 2: Extinction Burst (강화 패턴 붕괴) - 9 items
    {
        id: "SC_EXT_1",
        situation: "성공적이었던 기존의 업무 방식이 이번에는 전혀 통하지 않습니다.",
        options: [
            { id: "OP_pst_1", text: "기존 방식을 믿고 노력을 두 배로 늘린다.", type: "acting", weight: { proactivity: 10, adaptability: -10, socialDistance: 0 } },
            { id: "OP_rst_1", text: "처음부터 새로운 방식을 설계한다.", type: "thinking", weight: { proactivity: 5, adaptability: 15, socialDistance: 5 } },
            { id: "OP_ask_1", text: "동료들에게 솔직하게 조언을 구한다.", type: "feeling", weight: { proactivity: 0, adaptability: 10, socialDistance: -10 } },
            { id: "OP_hyb_1", text: "일단 손을 놓고 다른 프로젝트에 에너지를 쏟는다.", type: "thinking", weight: { proactivity: -5, socialDistance: 10, adaptability: 5 } } // 변경됨: 몰입 포기 + 전략적 후퇴
        ]
    },
    {
        id: "SC_EXT_2",
        situation: "아무리 메일을 보내도 주요 거래처로부터 답장이 없습니다.",
        options: [
            { id: "OP_pst_2", text: "답장이 올 때까지 계속 연락을 시도한다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 5 } },
            { id: "OP_rst_2", text: "다른 담당자를 찾거나 연락 채널을 바꾼다.", type: "thinking", weight: { proactivity: 5, adaptability: 10, socialDistance: 0 } },
            { id: "OP_fe_2", text: "혹시 내가 실수한 게 있는지 되돌아본다.", type: "feeling", weight: { proactivity: -5, adaptability: 5, socialDistance: -5 } },
            { id: "OP_vis_2", text: "거래처 명단에서 삭제하고 대체처를 물색한다.", type: "thinking", weight: { proactivity: 5, socialDistance: 12, adaptability: 0 } } // 변경됨: 관계 정리 + 효율 추구
        ]
    },
    {
        id: "SC_EXT_3",
        situation: "팀원들이 당신의 지시에 예전처럼 따르지 않고 불만을 표합니다.",
        options: [
            { id: "OP_pst_3", text: "기강을 잡기 위해 지시를 더 강력하게 내린다.", type: "acting", weight: { proactivity: 10, adaptability: -10, socialDistance: 10 } },
            { id: "OP_rst_3", text: "내 리더십 스타일에 문제가 있는지 점검한다.", type: "thinking", weight: { proactivity: 5, adaptability: 10, socialDistance: -5 } },
            { id: "OP_fe_3", text: "개별 면담으로 불만 사항을 들어본다.", type: "feeling", weight: { proactivity: 0, adaptability: 5, socialDistance: -10 } },
            { id: "OP_emp_3", text: "리더 역할에서 물러나겠다고 상부에 통보한다.", type: "thinking", weight: { proactivity: -5, socialDistance: 12, adaptability: 0 } } // 변경됨: 책임 이탈 + 자기보호
        ]
    },
    {
        id: "SC_EXT_4",
        situation: "즐겨 쓰던 핵심 소프트웨어 기능이 업데이트로 삭제되었습니다.",
        options: [
            { id: "OP_pst_4", text: "구버전을 구할 방법을 백방으로 찾는다.", type: "acting", weight: { proactivity: 5, adaptability: -10, socialDistance: 0 } },
            { id: "OP_rst_4", text: "대체 프로그램을 찾아 사용법을 익힌다.", type: "thinking", weight: { proactivity: 5, adaptability: 15, socialDistance: 0 } },
            { id: "OP_fe_4", text: "개발사에 강력하게 항의 메일을 보낸다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 5 } },
            { id: "OP_wf_4", text: "그 기능 없이 할 수 있는 범위로 업무를 축소한다.", type: "thinking", weight: { proactivity: -8, socialDistance: 10, adaptability: 0 } } // 변경됨: 성과 타협 + 최소 노력
        ]
    },
    {
        id: "SC_EXT_5",
        situation: "승진 심사에서 뛰어난 성과를 냈음에도 탈락했습니다.",
        options: [
            { id: "OP_pst_5", text: "다음에는 더 압도적인 성과를 내겠다고 다짐한다.", type: "acting", weight: { proactivity: 10, adaptability: 5, socialDistance: 5 } },
            { id: "OP_rst_5", text: "평가 기준을 분석하여 부족한 점을 찾는다.", type: "thinking", weight: { proactivity: 5, adaptability: 10, socialDistance: 5 } },
            { id: "OP_fe_5", text: "이직을 준비하거나 타 부서 이동을 알아본다.", type: "feeling", weight: { proactivity: 5, adaptability: 5, socialDistance: -10 } },
            { id: "OP_fb_5", text: "승진에 대한 기대를 접고 워라밸에 집중한다.", type: "thinking", weight: { proactivity: -8, socialDistance: 12, adaptability: 5 } } // 변경됨: 야망 포기 + 현실 타협
        ]
    },
    {
        id: "SC_EXT_6",
        situation: "매일 다니던 출근길이 공사로 완전히 막혔습니다.",
        options: [
            { id: "OP_pst_6", text: "어떻게든 틈새 길을 찾아 돌파하려 한다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 0 } },
            { id: "OP_rst_6", text: "지도 앱을 켜서 최적의 우회로를 찾는다.", type: "thinking", weight: { proactivity: 5, adaptability: 10, socialDistance: 0 } },
            { id: "OP_fe_6", text: "팀장에게 연락해 조금 늦는다고 양해를 구한다.", type: "feeling", weight: { proactivity: 0, adaptability: 5, socialDistance: -5 } },
            { id: "OP_wfh_6", text: "차 안에서 기다리다 공사가 끝날 때까지 출근을 미룬다.", type: "thinking", weight: { proactivity: -10, socialDistance: 10, adaptability: 0 } } // 변경됨: 무기력 + 상황 방관
        ]
    },
    {
        id: "SC_EXT_7",
        situation: "작성 중이던 문서가 컴퓨터 오류로 날아갔습니다. 백업도 없습니다.",
        options: [
            { id: "OP_pst_7", text: "분노하며 어떻게든 복구 프로그램을 돌려본다.", type: "acting", weight: { proactivity: 5, adaptability: -5, socialDistance: 0 } },
            { id: "OP_rst_7", text: "기억이 생생할 때 바로 다시 작성을 시작한다.", type: "thinking", weight: { proactivity: 10, adaptability: 10, socialDistance: 0 } },
            { id: "OP_fe_7", text: "잠시 바람을 쐬며 멘탈을 수습한다.", type: "feeling", weight: { proactivity: 0, adaptability: 5, socialDistance: 0 } },
            { id: "OP_it_7", text: "마감을 못 맞출 것 같다고 미리 통보하고, 퇴근한다.", type: "thinking", weight: { proactivity: -5, socialDistance: 12, adaptability: 0 } } // 변경됨: 책임 축소 + 손절
        ]
    },
    {
        id: "SC_EXT_8",
        situation: "당신이 맡은 제품이 갑자기 시장 트렌드와 맞지 않게 되었습니다.",
        options: [
            { id: "OP_pst_8", text: "우리 제품의 우수성을 알리는 마케팅을 강화한다.", type: "acting", weight: { proactivity: 10, adaptability: -10, socialDistance: 5 } },
            { id: "OP_rst_8", text: "트렌드에 맞춰 기능을 수정하고 개선한다.", type: "thinking", weight: { proactivity: 5, adaptability: 15, socialDistance: 0 } },
            { id: "OP_fe_8", text: "프로젝트 종료를 건의하고 새 아이템을 찾는다.", type: "thinking", weight: { proactivity: 5, adaptability: 5, socialDistance: -5 } },
            { id: "OP_nch_8", text: "담당 업무에서 빠지겠다고 요청하고, 다른 팀으로 이동한다.", type: "thinking", weight: { proactivity: -5, socialDistance: 12, adaptability: 5 } } // 변경됨: 배 탈출 + 자기보호
        ]
    },
    {
        id: "SC_EXT_9",
        situation: "믿고 따르던 멘토가 갑자기 퇴사했습니다.",
        options: [
            { id: "OP_pst_9", text: "그분의 가르침대로 흔들림 없이 일한다.", type: "thinking", weight: { proactivity: 5, adaptability: 0, socialDistance: 5 } },
            { id: "OP_rst_9", text: "새로운 멘토를 찾거나 내 스타일을 구축한다.", type: "acting", weight: { proactivity: 10, adaptability: 10, socialDistance: 0 } },
            { id: "OP_fe_9", text: "상실감을 느끼며 당분간 방황한다.", type: "feeling", weight: { proactivity: -5, adaptability: -5, socialDistance: -5 } },
            { id: "OP_net_9", text: "앞으로는 누구에게도 의지하지 않겠다고 결심한다.", type: "thinking", weight: { proactivity: 0, socialDistance: 15, adaptability: -5 } } // 변경됨: 관계 단절 + 자기의존
        ]
    },

    // Theme 3: Social Archetype (사회적 아키타입) - 9 items
    {
        id: "SC_SOC_1",
        situation: "당신보다 직급이 낮은 팀원이 회의 중 당신의 결정에 공개적으로 반론을 제기합니다.",
        options: [
            { id: "OP_bld_1", text: "위계와 질서를 위해 단호하게 내 결정의 근거를 재확인시킨다.", type: "acting", weight: { proactivity: 10, adaptability: -10, socialDistance: 10 } },
            { id: "OP_inv_1", text: "좋은 의견이라면 즉시 수용하고 내 안을 수정한다.", type: "thinking", weight: { proactivity: 10, adaptability: 10, socialDistance: -5 } },
            { id: "OP_nav_1", text: "일단 존중하는 척하며 상황을 부드럽게 넘긴다.", type: "feeling", weight: { proactivity: -5, adaptability: 10, socialDistance: -10 } },
            { id: "OP_dis_1", text: "아무 반응 없이 다음 안건으로 넘어간다.", type: "thinking", weight: { proactivity: -5, socialDistance: 15, adaptability: -5 } } // 변경됨: 무시 + 권위 포기
        ]
    },
    {
        id: "SC_SOC_2",
        situation: "회사의 불합리한 규칙 때문에 업무 효율이 떨어지고 있습니다.",
        options: [
            { id: "OP_inv_2", text: "규칙을 깨더라도 효율적인 새로운 방식을 시도한다.", type: "acting", weight: { proactivity: 15, adaptability: 10, socialDistance: 0 } },
            { id: "OP_bld_2", text: "공식적인 절차를 밟아 규칙 개정을 건의한다.", type: "thinking", weight: { proactivity: 5, adaptability: -5, socialDistance: 10 } },
            { id: "OP_ind_2", text: "내 방식대로 조용히 처리하고 결과로 증명한다.", type: "feeling", weight: { proactivity: 0, adaptability: 0, socialDistance: 10 } },
            { id: "OP_col_2", text: "불합리하든 말든 규칙대로만 하고, 책임은 회사에 돌린다.", type: "thinking", weight: { proactivity: -8, socialDistance: 12, adaptability: 5 } } // 변경됨: 수동적 저항 + 책임 회피
        ]
    },
    {
        id: "SC_SOC_3",
        situation: "동기들이 사내 정치를 통해 승진 기회를 잡으려 합니다.",
        options: [
            { id: "OP_ind_3", text: "나는 내 갈 길을 간다. 실력으로만 승부한다.", type: "thinking", weight: { proactivity: 0, adaptability: -5, socialDistance: 15 } },
            { id: "OP_nav_3", text: "나도 흐름에 합류하여 인맥을 관리한다.", type: "feeling", weight: { proactivity: 5, adaptability: 10, socialDistance: -10 } },
            { id: "OP_bld_3", text: "객관적인 성과 데이터를 만들어 압도적인 차이를 보여준다.", type: "acting", weight: { proactivity: 10, adaptability: -5, socialDistance: 5 } },
            { id: "OP_bal_3", text: "승진 경쟁 자체에서 빠지고, 현 직급에 안주한다.", type: "thinking", weight: { proactivity: -10, socialDistance: 12, adaptability: 5 } } // 변경됨: 야망 포기 + 게임 이탈
        ]
    },
    {
        id: "SC_SOC_4",
        situation: "프로젝트가 실패 위기에 처했고, 누군가는 책임을 져야 합니다.",
        options: [
            { id: "OP_bld_4", text: "내가 총대를 메고 사태를 수습한다.", type: "acting", weight: { proactivity: 15, adaptability: 0, socialDistance: 5 } },
            { id: "OP_nav_4", text: "책임을 분산시키고 피해를 최소화할 방법을 찾는다.", type: "feeling", weight: { proactivity: -5, adaptability: 15, socialDistance: -5 } },
            { id: "OP_inv_4", text: "위기를 기회로 전환할 획기적인 전환점을 제안한다.", type: "thinking", weight: { proactivity: 10, adaptability: 15, socialDistance: 0 } },
            { id: "OP_anl_4", text: "내 담당 범위만 명확히 정리하고, 나머지는 관여하지 않는다.", type: "thinking", weight: { proactivity: -5, socialDistance: 15, adaptability: 0 } } // 변경됨: 책임 한정 + 방관
        ]
    },
    {
        id: "SC_SOC_5",
        situation: "팀의 분위기가 침체되어 성과가 나지 않고 있습니다.",
        options: [
            { id: "OP_inv_5", text: "완전히 새로운 목표를 제시하여 가슴을 뛰게 만든다.", type: "acting", weight: { proactivity: 10, adaptability: 10, socialDistance: -5 } },
            { id: "OP_nav_5", text: "팀원들의 고충을 들어주고 회식이나 이벤트를 연다.", type: "feeling", weight: { proactivity: 0, adaptability: 10, socialDistance: -15 } },
            { id: "OP_ind_5", text: "내 할 일을 완벽히 해내며 묵묵히 모범을 보인다.", type: "thinking", weight: { proactivity: 5, adaptability: 0, socialDistance: 10 } },
            { id: "OP_str_5", text: "팀 분위기는 신경 쓰지 않고, 개인 KPI 달성에만 집중한다.", type: "thinking", weight: { proactivity: 0, socialDistance: 15, adaptability: -5 } } // 변경됨: 팀 무관심 + 개인주의
        ]
    },
    {
        id: "SC_SOC_6",
        situation: "상사에게 부당한 업무 지시를 받았습니다.",
        options: [
            { id: "OP_bld_6", text: "조직의 위계이므로 일단 따르되 기록을 남긴다.", type: "thinking", weight: { proactivity: 5, adaptability: -5, socialDistance: 5 } },
            { id: "OP_inv_6", text: "논리적으로 반박하고 더 나은 대안을 제시한다.", type: "acting", weight: { proactivity: 10, adaptability: 5, socialDistance: 0 } },
            { id: "OP_ind_6", text: "최소한의 흉내만 내고 내 중요한 업무에 집중한다.", type: "feeling", weight: { proactivity: -5, adaptability: 0, socialDistance: 10 } },
            { id: "OP_hr_6", text: "증거를 모아두고, 이직 시 활용할 수 있게 준비한다.", type: "thinking", weight: { proactivity: -3, socialDistance: 12, adaptability: 5 } } // 변경됨: 은밀한 준비 + 장기 전략
        ]
    },
    {
        id: "SC_SOC_7",
        situation: "업계 주요 인사들이 모이는 네트워킹 파티에 초대받았습니다.",
        options: [
            { id: "OP_nav_7", text: "최대한 많은 사람과 명함을 교환하고 인사를 튼다.", type: "acting", weight: { proactivity: 5, adaptability: 15, socialDistance: -10 } },
            { id: "OP_bld_7", text: "나에게 필요한 핵심 인물 몇 명만 공략한다.", type: "thinking", weight: { proactivity: 10, adaptability: 0, socialDistance: 5 } },
            { id: "OP_ind_7", text: "굳이 가지 않거나, 가더라도 구석에서 관망한다.", type: "feeling", weight: { proactivity: -5, adaptability: -5, socialDistance: 15 } },
            { id: "OP_obs_7", text: "참석자 명단만 확인하고, 파티에는 가지 않는다.", type: "thinking", weight: { proactivity: -3, socialDistance: 15, adaptability: 0 } } // 변경됨: 정보만 취득 + 관계 거부
        ]
    },
    {
        id: "SC_SOC_8",
        situation: "당신이 속한 조직이 구시대적이고 관료적으로 변해가고 있습니다.",
        options: [
            { id: "OP_inv_8", text: "조직 문화를 바꿀 혁신적인 캠페인을 주도한다.", type: "acting", weight: { proactivity: 15, adaptability: 10, socialDistance: 0 } },
            { id: "OP_ind_8", text: "조직은 조직이고 나는 나다. 신경 쓰지 않는다.", type: "thinking", weight: { proactivity: 0, adaptability: -5, socialDistance: 10 } },
            { id: "OP_nav_8", text: "현 체제 안에서 내가 이득을 볼 수 있는 포지션을 찾는다.", type: "feeling", weight: { proactivity: 5, adaptability: 10, socialDistance: -5 } },
            { id: "OP_ext_8", text: "조직이 망하든 말든 상관없이, 내 업무만 처리한다.", type: "thinking", weight: { proactivity: -5, socialDistance: 15, adaptability: 0 } } // 변경됨: 조직 운명 무관심 + 극단적 분리
        ]
    },
    {
        id: "SC_SOC_9",
        situation: "모든 것이 불확실한 재난급 위기 상황이 닥쳤습니다.",
        options: [
            { id: "OP_bld_9", text: "내가 컨트롤 타워가 되어 질서와 규율을 잡는다.", type: "acting", weight: { proactivity: 15, adaptability: -5, socialDistance: 10 } },
            { id: "OP_inv_9", text: "기존의 매뉴얼을 버리고 파격적인 생존법을 찾는다.", type: "thinking", weight: { proactivity: 10, adaptability: 15, socialDistance: 0 } },
            { id: "OP_nav_9", text: "대세의 흐름을 읽고 가장 안전한 집단에 합류한다.", type: "feeling", weight: { proactivity: 0, adaptability: 15, socialDistance: -10 } },
            { id: "OP_clm_9", text: "누구도 돕지 않고, 혼자서 탈출 경로를 확보한다.", type: "thinking", weight: { proactivity: 5, socialDistance: 15, adaptability: 0 } } // 변경됨: 이기적 생존 + 연대 거부
        ]
    }
];
