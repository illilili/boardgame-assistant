    import { createBrowserRouter } from 'react-router-dom';

    import Home from './mainPage/Home';
    import MainContent from './mainPage/MainContent';
    import Header from './mainPage/Header';
    import Footer from './mainPage/Footer';
    import Plan from './plan/Plan';
    import Publishing from './publishing/Publishing';
    import DeveloperAssignment from './publishing/DeveloperAssignment';
    import Translation from './publishing/Translation';
    import TranslationReview from './publishing/TranslationReview';
    import PricingEvaluation from './publishing/PricingEvaluation';
    import FinalApproval from './publishing/FinalApproval';

    import Login from './pages/auth/Login';
    import SignUp from './pages/auth/SignUp';
    import MyPage from './pages/users/MyPage';

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
            element: <Footer/>
        },
        {
            id: 4,
            path:'/plan',
            element: <Plan/>
        },
        {
            id: 5,
            path:'/publishing',
            element: <Publishing/>
        },
        {
            id: 6,
            path:'/developer-assignment',
            element: <DeveloperAssignment/>
        },
        {
            id: 7,
            path:'/translation',
            element: <Translation/>
        },
        {
            id: 8,
            path:'/translation-review',
            element: <TranslationReview/>
        },
        {
            id: 9,
            path:'/pricing-evaluation',
            element: <PricingEvaluation/>
        },
        {
            id: 10,
            path:'/final-approval',
            element: <FinalApproval/>
        },
        {
            id: 11,
            path:'/login', 
            element: <Login/>
        },
        {
            id: 12,
            path:'/signup',
            element: <SignUp/>
        },
        {
            id: 13,
            path:'/mypage',
            element: <MyPage/>
        }
    ]);
    export default router;