import { IonHeader, IonToolbar, IonTitle, IonLabel, IonText } from "@ionic/react";
import { useEffect, useState } from "react";
import { getUserData, updateUserPoints } from "../services/api";

interface UserData {
    username: string;
    points: number;
    plasticDiscarted: number;
    metalDiscarted: number;
}

interface TrashStats {
    plastic: number;
    metal: number;
}

const Header: React.FC = () => {
    const [points, setPoints] = useState<number>(0);
    const [username, setUsername] = useState<string>("");
    const [trashStats, setTrashStats] = useState<TrashStats>({
        plastic: 0,
        metal: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<{ price: number } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getUserData();
                setUsername(userData.username);
                setPoints(userData.points);
                setTrashStats({
                    plastic: userData.plasticDiscarted || 0,
                    metal: userData.metalDiscarted || 0,
                });
            } catch (err) {
                setError("Erro ao carregar dados do usuário");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
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
        <IonHeader className="store-header" collapse="condense">
            <IonToolbar className="custom-toolbar">
                <IonTitle size="large" className="custom-title">
                    Bem vindo, {username}!
                </IonTitle>
                <div className="points-display">
                    <IonLabel>Seu saldo de pontos</IonLabel>
                    <IonText>
                        <h2>{points}</h2>
                    </IonText>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};

export default Header;