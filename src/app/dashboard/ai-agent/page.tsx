'use client';

export default function AIAgentPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-gray-900">وكيل الذكاء الاصطناعي</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            هنا سيتم إعداد الردود التلقائية بالذكاء الاصطناعي على رسائل العملاء. سيتمكن النظام من
            فهم الأسئلة والرد عليها بشكل ذكي ومناسب.
          </p>

          {/* TODO: AI Agent Configuration */}
          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <p className="text-sm text-primary-900 font-medium">قريبًا</p>
            <p className="text-sm text-primary-700 mt-2">
              سيتم إضافة واجهة لإعداد قواعد الذكاء الاصطناعي، القوالب، والردود التلقائية
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">ردود ذكية</h3>
            <p className="text-sm text-gray-600">
              ردود تلقائية مبنية على فهم السياق والمحتوى
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-gray-900 mb-2">قابل للتخصيص</h3>
            <p className="text-sm text-gray-600">إعداد قوالب وقواعد مخصصة لنشاطك التجاري</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">تحسين مستمر</h3>
            <p className="text-sm text-gray-600">تعلم من المحادثات لتحسين جودة الردود</p>
          </div>
        </div>
      </div>
    </div>
  );
}
