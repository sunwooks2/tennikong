import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const EFFECTIVE_DATE = '2026년 8월 26일';
const CONTACT_EMAIL = 'sunwooks2@gmail.com';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    body:
      '테니콩(이하 "회사" 또는 "앱")은 회원가입 및 서비스 제공을 위해 아래 정보를 수집합니다.\n\n' +
      '· 소셜 로그인(카카오, 구글, 네이버) 시: 이메일 주소, 닉네임, 프로필 사진 (제공 동의 시)\n' +
      '· 서비스 이용 중 이용자가 직접 입력하는 정보: 경기 날짜, 함께한 파트너/상대방 이름, 코트 종류, 스코어, 경기 메모\n' +
      '· 문의/개선 제안 작성 시: 문의 내용, 답변받을 연락처(선택 입력)\n' +
      '· 서비스 이용 기록: 화면 방문 및 버튼 조작 이력 (앱 개선을 위한 이용 패턴 분석 목적, 광고·외부 분석 SDK는 사용하지 않으며 자체 서버에만 저장됩니다)\n' +
      '· 자동 수집 정보: 서버(Supabase) 접속 로그 등 서비스 운영에 필요한 최소한의 기술 정보가 처리될 수 있습니다.',
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    body:
      '· 회원 식별 및 로그인 서비스 제공\n' +
      '· 경기 기록, 통계, 성장 그래프 등 핵심 서비스 제공\n' +
      '· 경기 결과 공유 카드 생성\n' +
      '· 문의사항 및 개선 제안 응대\n' +
      '· 이용 패턴 분석을 통한 서비스 개선\n' +
      '· 부정 이용 방지 및 서비스 안정성 확보',
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    body:
      '이용자가 회원 탈퇴를 요청하면 관련 개인정보는 지체 없이 파기합니다. 다만 관계 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.',
  },
  {
    title: '4. 개인정보의 제3자 제공',
    body: '회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 사전에 동의하거나 법령에 특별한 규정이 있는 경우는 예외로 합니다.',
  },
  {
    title: '5. 개인정보 처리 위탁',
    body:
      '서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.\n\n' +
      '· Supabase (데이터베이스 및 인증 서비스 운영)\n' +
      '· 카카오 (소셜 로그인 및 알림 발송)',
  },
  {
    title: '6. 이용자의 권리와 행사 방법',
    body:
      '이용자는 언제든지 자신의 개인정보를 열람, 정정, 삭제하거나 처리 정지를 요구할 수 있습니다. 앱 내 "마이페이지"에서 로그아웃 및 문의를 통해 요청할 수 있으며, 회원 탈퇴(계정 및 관련 데이터 삭제)를 원하시는 경우 아래 이메일로 요청해주시면 확인 후 지체 없이 처리해 드립니다.',
  },
  {
    title: '7. 개인정보의 파기 절차 및 방법',
    body: '전자적 파일 형태로 저장된 개인정보는 복구 및 재생이 불가능한 방법으로 영구 삭제합니다.',
  },
  {
    title: '8. 개인정보 보호책임자',
    body: `문의사항이나 개인정보 관련 요청은 아래 연락처로 접수해 주시기 바랍니다.\n\n이메일: ${CONTACT_EMAIL}`,
  },
  {
    title: '9. 고지의 의무',
    body: '이 개인정보처리방침의 내용이 변경되는 경우 앱 내 공지 또는 본 페이지를 통해 고지합니다.',
  },
];

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: '개인정보처리방침' }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>테니콩 개인정보처리방침</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>시행일자: {EFFECTIVE_DATE}</Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 64,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
});
