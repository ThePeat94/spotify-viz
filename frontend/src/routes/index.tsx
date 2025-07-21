import { createFileRoute } from '@tanstack/react-router';
import App from 'src/App';


const Index = () =>  {
    return (
        <App/>
    );
};

export const Route = createFileRoute('/')({
    component: Index,
});
