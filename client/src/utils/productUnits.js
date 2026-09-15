export const getProductUnit = (productName = "") => {
  const name = productName.toLowerCase();

  if (name.includes("cement")) return "bag";
  if (name.includes("brick")) return "piece";
  if (name.includes("aac")) return "block";
  if (name.includes("tmt") || name.includes("steel")) return "kg";
  if (name.includes("sand") || name.includes("gravel")) return "ton";
  if (name.includes("pipe")) return "ft";
  if (name.includes("paint")) return "litre";
  if (name.includes("putty")) return "kg";
  if (name.includes("tile")) return "sq.ft";
  if (name.includes("wire") || name.includes("cable")) return "meter";
  if (name.includes("helmet") || name.includes("tool")) return "unit";

  return "unit";
};