export const getForme = (forme) => {
    if (forme === "Alolan") {
        return "-a";
    }
    if (forme === "Galarian") return "-g";
    if (forme === "Gigantamax") return "-gi";
    if (forme === "Heart") return "-h";
    if (forme === "Star") return "-s";
    if (forme === "Diamond") return "-d";
    if (forme === "Debutante") return "-de";
    if (forme === "Matron") return "-m";
    if (forme === "Dandy") return "-da";
    if (forme === "La Reine") return "-l";
    if (forme === "Kabuki") return "-k";
    if (forme === "Pharaoh") return "-p";
    if (forme === "Mega") return "-m";
    if (forme === "East Sea") return "e";
    if (forme === "Eternal Flower") return "-eternal";
    return "";
};
