import { useState } from 'react'

import './App.css'

function App() {
  const queryClient = new QueryClient();
  return (
    // <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
       <QueryClientProvider client={queryClient}>
         <BrowserRouter>
           <Suspense fallback={<div>Loading...</div>}>
             <Routes>
               <Route element={<Layout />}>
                 <Route path="/" element={<Website />} />
                 <Route path="/properties">
                   <Route index element={<Properties />} />
                   <Route path=":propertyId" element={<Property />} />
                 </Route>
                 { /* Uncomment the following lines if you want to use UserDetailContext*/}
                 <Route path="/bookings" element={<Bookings />} />
                 <Route path="/favourites" element={<Favourites />} />
               </Route>
             </Routes>
           </Suspense>
         </BrowserRouter>
         <ToastContainer />
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
       
      )
       ;
}

export default App
