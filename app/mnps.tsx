import Link from "next/link";

export default function Mnps() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-4">mnps 서비스</h1>
            <p className="mb-2">이 페이지는 mnps 서비스에 대한 프록시 페이지입니다.</p>
            <Link href="../mnps" className="text-blue-500 underline">
                실제 mnps 애플리케이션으로 이동
            </Link>
        </div>
    );
}
