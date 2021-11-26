import React, { FC } from 'react';
import { useUtils } from 'hooks/index';
import { Button, Card } from 'antd';
import { Header } from 'containers/common/Header';
//import { AuthViewLayout } from 'containers/common/Layout';
import { AuthViewLayout } from 'containers/common/Layout/AuthViewLayout';

const AboutView: FC = () => {
  const { alert } = useUtils();
  
  const handleSupportClick = () => {
    alert.show('You will be redirected to Syscoin Discord, please contact support team at #pali_support', {
      timeout: 5000,
      type: 'success',
      onClose: () => {
        window.open('https://discord.gg/8QKeyurHRd')
      }
    });

  };
  const handleDocsClick = () => {
    window.open('https://docs.paliwallet.com/');
  };
  
  return (
    <>
      <Header normalHeader />
      <div className="flex justify-center items-center flex-col min-w-full">
          <AuthViewLayout title="INFO & HELP"> </AuthViewLayout>
          <div className="flex justify-center flex-col text-brand-white pt-6">
            <div>
              <p className="text-base">Pali Wallet Chrome Extension v1.0</p>
              <p className="text-base">Version: 1.0.13</p>
              <span className="text-base">
                API Docs : {''}
                <a
                  onClick={handleDocsClick}
                >
                Pali API
                </a>
              </span>
            </div>
            <div className="flex items-center justify-center pt-4 pb-36">
              <Card className="w-full rounded text-brand-white" style={{ width: 320, border: '1px', background: '#4d76b8' }}>
               <div className="p-4">
                  <div className="flex flex-col text-brand-white">
                    <div>
                      <p className="text-base">Client Support{' '} </p>
                    </div>
                    <div>
                      <a onClick={handleSupportClick} className="text-sm">Click here to be redirected to Syscoin Discord, please contact support team at #pali_support</a>
                    </div>
                  </div>
               </div>
              </Card>
            </div>
          </div>
          <div className="p-0.5 bg-primary rounded-full ">
            <Button
              className="bg-brand-navy tracking-normal text-base py-2.5 px-12 cursor-pointer rounded-full text-brand-white hover:backgroundImage"
            >
              Close
            </Button>
          </div>
      </div>
    </>
  );
};

export default AboutView;
