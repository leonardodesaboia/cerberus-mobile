import { IonTabBar, IonTabButton, IonLabel } from '@ionic/react'

const Toolbar: React.FC = () => {
  return (
    <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <ion-icon name="home-sharp"></ion-icon>
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="loja" href="/store">
            <ion-icon name="storefront-sharp"></ion-icon>
            <IonLabel>Loja</IonLabel>
          </IonTabButton>
          <IonTabButton tab="config" href="/config">
            <ion-icon name="person"></ion-icon>
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
  )
}

export default Toolbar;