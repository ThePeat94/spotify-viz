import { createFileRoute } from '@tanstack/react-router';

const Imprint = () => {
    return (
        <>Some funny imprint</>
    );
};

export const Route = createFileRoute('/imprint')({
    component: Imprint,
});
