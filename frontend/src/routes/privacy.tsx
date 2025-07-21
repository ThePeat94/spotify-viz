import { createFileRoute } from '@tanstack/react-router';

const Privacy = () => {
    return (
        <>Privacy :) </>
    );
};

export const Route = createFileRoute('/privacy')({
    component: Privacy,
});
