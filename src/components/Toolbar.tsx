import { IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/react';
import { useLocation } from 'react-router-dom';

const Toolbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <IonTabBar slot="bottom">
      <IonTabButton 
        tab="home" 
        href="/home"
        className={currentPath === '/home' ? 'active-tab' : ''}
      >
        <IonIcon icon="home-sharp" className="toolbar-icons" />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      
      <IonTabButton 
        tab="loja" 
        href="/store"
        className={currentPath === '/store' ? 'active-tab' : ''}
      >
        <IonIcon icon="storefront-sharp" className="toolbar-icons" />
        <IonLabel>Loja</IonLabel>
      </IonTabButton>

      <IonTabButton 
        tab="redeem" 
        href="/redeem"
        className={currentPath === '/redeem' ? 'active-tab' : ''}
      >
        <IonIcon icon="gift-outline" className="toolbar-icons" />
        <IonLabel>Meus produtos</IonLabel>
      </IonTabButton>
            
      <IonTabButton 
        tab="config" 
        href="/config"
        className={currentPath === '/config' ? 'active-tab' : ''}
      >
        <IonIcon icon="person" className="toolbar-icons" />
        <IonLabel>Perfil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Toolbar;