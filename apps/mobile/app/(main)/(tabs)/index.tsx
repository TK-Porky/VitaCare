import { useState } from "react";
import { BoardTabView } from "../home/boardView";
import { MapTabView } from "../home/mapView";

export default function HomeScreen() {
  // Définir l'état de la vue actuelle (1: Vue sur la Carte, 0: Vue le Tableau de Board)
  const  [currentView, SetCurrentView] = useState<0 | 1>(0)

  if (currentView == 1) {
    return <MapTabView />
  }

  return <BoardTabView onMap={() => SetCurrentView(1)}/>;
}