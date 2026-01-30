import React from 'react';
import { Helmet } from 'react-helmet';
import ApothecaryGame from '@/components/ApothecaryGame';

function App() {
  return (
    <>
      <Helmet>
        {/* Updated Title */}
        <title>The Alchemist of Alley 9</title>
        <meta name="description" content="A dark fantasy apothecary game where you brew potions to cure mysterious ailments. Match ingredients to symptoms and manage your reputation." />
      </Helmet>
      <div className='min-h-screen bg-slate-950 text-amber-500'>
        <ApothecaryGame />
      </div>
    </>
  );
}

export default App;