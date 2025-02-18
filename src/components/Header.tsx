import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText } from "@ionic/react"

const Header: React.FC = () => {
    return (
                    <IonHeader className="store-header" collapse="condense">
                      <IonToolbar className="custom-toolbar">
                        <IonTitle size="large" className="custom-title">Bem vindo, João!</IonTitle>
                        <div className="points-display">
                          <IonLabel>Seu saldo de pontos</IonLabel>
                          <IonText>
                            <h2>98</h2>
                          </IonText>
                        </div>
                      </IonToolbar>
                    </IonHeader>
    )
}

export default Header;