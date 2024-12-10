import { RecordCard } from '../../components/RecordCard';
import { mockRecords } from '../../mocks/records';

export function RecordsList() {
  return (
    <div className="w-[400px] bg-gray-50 p-6 border-l border-gray-200 overflow-y-auto">
      {mockRecords.map((record, index) => (
        <RecordCard key={index} {...record} />
      ))}
    </div>
  );
}