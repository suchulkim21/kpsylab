export const metadata = {
  title: 'KPSY Typing - 타자 연습 게임',
  description: '졸라맨 배틀과 함께하는 타자 연습 게임',
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
      {children}
    </div>
  );
}
