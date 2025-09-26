// pages/admin/Exports.jsx
import { Download, FileText, Sheet, FileDown } from 'lucide-react';

const Exports = () => {
  const exportOptions = [
    {
      title: 'Sales Data',
      description: 'Export all sales records in various formats',
      formats: [
        { type: 'Excel', icon: Sheet, color: 'text-green-600' },
        { type: 'PDF', icon: FileText, color: 'text-red-600' },
        { type: 'CSV', icon: FileDown, color: 'text-blue-600' }
      ]
    },
    {
      title: 'Expenses Data',
      description: 'Export all expense records in various formats',
      formats: [
        { type: 'Excel', icon: Sheet, color: 'text-green-600' },
        { type: 'PDF', icon: FileText, color: 'text-red-600' },
        { type: 'CSV', icon: FileDown, color: 'text-blue-600' }
      ]
    },
    {
      title: 'Stock Requests',
      description: 'Export stock request data',
      formats: [
        { type: 'Excel', icon: Sheet, color: 'text-green-600' },
        { type: 'PDF', icon: FileText, color: 'text-red-600' },
        { type: 'CSV', icon: FileDown, color: 'text-blue-600' }
      ]
    },
    {
      title: 'Transport Data',
      description: 'Export transport and logistics data',
      formats: [
        { type: 'Excel', icon: Sheet, color: 'text-green-600' },
        { type: 'PDF', icon: FileText, color: 'text-red-600' },
        { type: 'CSV', icon: FileDown, color: 'text-blue-600' }
      ]
    }
  ];

  const handleExport = (dataType, format) => {
    // Implement export functionality
    console.log(`Exporting ${dataType} as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Exports</h1>
          <p className="text-gray-600">Export system data in various formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
            <p className="text-gray-600 mb-4">{option.description}</p>
            
            <div className="flex space-x-3">
              {option.formats.map((format, formatIndex) => (
                <button
                  key={formatIndex}
                  onClick={() => handleExport(option.title, format.type)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <format.icon className={`h-4 w-4 ${format.color}`} />
                  <span>{format.type}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exports;