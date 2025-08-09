import { createBrowserRouter } from 'react-router-dom';

import Home from './mainPage/Home';
import MainContent from './mainPage/MainContent';
import Header from './mainPage/Header';
import Footer from './mainPage/Footer';
import Plan from './plan/Plan';

const router = createBrowserRouter([
    {
        id: 0,
        path:'/',
        element:<Home/>
    },
    {
        id: 1,
        path: '/MainContent',
        element: <MainContent />,
    },
    {
        id: 2,
        path:'/Header',
        element: <Header/>
    },
    {
        id: 3,
        path:'/footer',
        elment: <Footer/>
    },
    {
        id: 4,
        path:'/plan',
        element: <Plan/>
    }



]);
export default router;