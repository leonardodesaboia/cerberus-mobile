import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText, IonIcon, IonButtons, IonButton, IonRow, IonCol, IonGrid } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData } from "../services/api";
import PointsUpdateEvent from "../utils/pointsUpdateEvent";
import { chevronForward } from 'ionicons/icons'; // Use correct icon name

const Header: React.FC = () => {
    console.log("Header component rendering");
    const [username, setUsername] = useState<string>("Usuário");
    const [currentPoints, setCurrentPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            // First check if we can access localStorage (common issue on Android)
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            
            console.log("Token exists:", !!token);
            console.log("UserId exists:", !!userId);
            
            if (!token || !userId) {
                console.warn("Missing token or userId in localStorage");
                setUsername("Visitante");
                setCurrentPoints(0);
                setLoading(false);
                return;
            }
            
            console.log("Fetching user data...");
            const userData = await getUserData();
            console.log("User data received:", userData);
            
            setUsername(userData.username || "Usuário");
            setCurrentPoints(userData.points || 0);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Erro ao carregar dados");
            // Set default values instead of showing error
            setUsername("Usuário");
            setCurrentPoints(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Header component mounted");
        fetchUserData();
        
        PointsUpdateEvent.subscribe(fetchUserData);

        return () => {
            console.log("Header component unmounting");
            PointsUpdateEvent.unsubscribe(fetchUserData);
        };
    }, []);

    const changeWindow = () => {
        window.location.href = '/statement';
    };

    // This ensures the header appears even during loading or errors
    return (
        <IonHeader className="ion-no-border" style={{ position: 'relative', zIndex: 1000 }}>
            <IonToolbar mode="md">
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <IonTitle size="large">
                                Bem vindo(a) {loading ? "..." : username}
                            </IonTitle>
                        </IonCol>
                    </IonRow>
                    
                    <IonRow className="ion-align-items-center ion-justify-content-center">
                        <IonCol size="12" className="ion-text-center">
                            <IonLabel>
                                Seu saldo de pontos
                            </IonLabel>
                        </IonCol>
                    </IonRow>
                    
                    <IonRow className="ion-align-items-center ion-justify-content-center">
                        <IonCol size="auto" className="ion-text-center">
                            <IonButton fill="clear" onClick={changeWindow}>
                                <IonText color="primary">
                                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>
                                        {loading ? "..." : currentPoints}
                                    </h3>
                                </IonText>
                                <IonIcon slot="end" icon={chevronForward} />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;