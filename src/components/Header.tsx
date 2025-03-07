import { IonHeader, IonToolbar, IonTitle } from "@ionic/react";

const Header: React.FC = () => {
  console.log("Rendering minimal header component");
  
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>Test Header</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;