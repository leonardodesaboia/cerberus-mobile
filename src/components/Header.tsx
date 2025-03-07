import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText, IonIcon, IonContent } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData } from "../services/api";
import PointsUpdateEvent from "../utils/pointsUpdateEvent";
import { chevronForwardOutline } from 'ionicons/icons'; // Import the specific icon

const Header: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [currentPoints, setCurrentPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            const userData = await getUserData();
            setUsername(userData.username);
            setCurrentPoints(userData.points);
        } catch (err) {
            setError("Erro ao carregar dados do usuário");
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        
        PointsUpdateEvent.subscribe(fetchUserData);

        return () => {
            PointsUpdateEvent.unsubscribe(fetchUserData);
        };
    }, []);

    const changeWindow = () => {
        window.location.href = '/statement';
    }

    if (loading) {
        return (
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Carregando...</IonTitle>
                </IonToolbar>
            </IonHeader>
        );
    }

    if (error) {
        return (
            <IonHeader>
                <IonToolbar>
                    <IonTitle color="danger">{error}</IonTitle>
                </IonToolbar>
            </IonHeader>
        );
    }

    return (
        <IonHeader>
            <IonToolbar>
                <IonTitle size="large" style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    padding: '10px'
                }}>
                    Bem vindo(a) {username}
                </IonTitle>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    padding: '0 15px 10px 15px'
                }}>
                    <IonLabel style={{ 
                        fontSize: '14px', 
                        marginBottom: '5px' 
                    }}>
                        Seu saldo de pontos
                    </IonLabel>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                    }}>
                        <IonText>
                            <h3 style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold',
                                margin: '0'
                            }}>
                                {currentPoints}
                            </h3>
                        </IonText>
                        <IonIcon 
                            icon={chevronForwardOutline} 
                            style={{
                                fontSize: '20px',
                                marginLeft: '5px'
                            }} 
                            onClick={changeWindow}
                        />
                    </div>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;