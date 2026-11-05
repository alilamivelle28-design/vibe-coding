import { redirect } from "next/navigation";

// Ancienne adresse de « Mon profil », gardée pour les liens déjà envoyés par mail.
export default function Espace() {
  redirect("/profil");
}
