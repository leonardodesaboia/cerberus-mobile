import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData } from "../services/api";
import PointsUpdateEvent from "../utils/pointsUpdateEvent";

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        
        // Registrar o listener para atualizações de pontos
        PointsUpdateEvent.subscribe(fetchUserData);

        // Cleanup
        return () => {
            PointsUpdateEvent.unsubscribe(fetchUserData);
        };
    }, []);

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
        <IonHeader className="store-header" collapse="condense" >
            <IonToolbar className="custom-toolbar">
                <IonTitle size="large" className="custom-title">
                    Bem vindo(a) {username}!
                </IonTitle>
                <div className="points-display">
                    <IonLabel className="custom-saldo">Seu saldo de pontos</IonLabel>
                    <IonText>
                        <h3 className="custom-points">{currentPoints} <ion-icon name="chevron-forward-outline" style={{fontSize: "20px"}}></ion-icon></h3>
                    </IonText>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;