import { RecordCard } from './RecordCard';

interface Record {
  tokenName: string;
  network: string;
  amount: string;
  liquidityType: string;
  priceRange: string;
  pairInfo?: string;
  address?: string;
  poolPairInfo?: string;
}

interface RecordListProps {
  records: Record[];
}

export function RecordList({ records = [] }: RecordListProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-10">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg">No records yet.</p>
            <p className="text-sm">Select and enter the relevant address on the left to display TAL information.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex flex-col items-center sm:items-stretch">
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
              poolPairInfo={record.poolPairInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
}