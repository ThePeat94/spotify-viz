import React, { useRef } from 'react';
import { WrappedData } from 'src/components/cards/wrapped/type';
import MiniWrappedCard from 'src/components/cards/wrapped/MiniWrappedCard';
import { exportNode } from 'src/utils/export';

type Props = {
    year?: number;
    month?: number;
    wrappedData: WrappedData,
};

/**
 * A component which displays the top data in a mini wrapped card format
 */
const ExportableMiniWrappedCard: React.FC<Props> = ({ year, month, wrappedData }) => {
    const cardRef = useRef(null);

    const handleExportClick = async (): Promise<void> => {
        if (!cardRef.current) {
            return;
        }

        const title = [month, year].filter(Boolean).join('-');

        await exportNode(cardRef.current, `wrapped-${title}.png`, { width: 660, height: 660 });
    };

    return (
        <>
            <MiniWrappedCard
                year={year}
                month={month}
                wrappedData={wrappedData}
                onExportClick={handleExportClick}
            />
            <div ref={cardRef} style={{ width: '660px', height: '0px', overflow: 'hidden' }}>
                <MiniWrappedCard
                    year={year}
                    month={month}
                    wrappedData={wrappedData}
                    isExportTemplate={true}
                />
            </div>
        </>
    );
};

export default ExportableMiniWrappedCard;
