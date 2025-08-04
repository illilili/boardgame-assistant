export default function TermsPage({ isOpen, onClose }) {
  if (!isOpen) return null; // false일 땐 아무것도 렌더링 X

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
        <h2 className="text-xl font-bold mb-4">이용 약관</h2>
        <div className="h-64 overflow-y-auto">
          <p>여기에 약관 내용이 들어갑니다...</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
