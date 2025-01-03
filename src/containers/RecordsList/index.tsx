import { RecordCard } from '../../components/Records/RecordCard';
import { mockRecords } from '../../mocks/records';

export function RecordsList() {
  return (
    <div className="w-[400px] bg-gray-50 p-6 border-l border-gray-200 overflow-y-auto border-2 border-solid border-gray-600">
      {mockRecords.map((record, index) => (
        <RecordCard key={index} {...record} />
      ))}
    </div>
  );
}