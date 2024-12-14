import { RecordCard } from './RecordCard';

interface Record {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
}

interface RecordListProps {
  records: Record[];
}

export function RecordList({ records }: RecordListProps) {
  return (
    <div className="border-l border-gray-200 pl-6 ml-6">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg">No records yet.</p>
            <p className="text-sm">Select and enter the relevant address on the left to display TAL information.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <RecordCard
              key={index}
              tokenName={record.tokenName}
              network={record.network}
              amount={record.amount}
              liquidityType={record.liquidityType}
              priceRange={record.priceRange}
              pairInfo={record.pairInfo}
              address={record.address}
            />
          ))}
        </div>
      )}
    </div>
  );
}