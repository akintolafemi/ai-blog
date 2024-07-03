export const FilterRequestObject = (queryObj: Record<any, any>, array: string[], useDeleted = true) => {
  const obj = useDeleted ? {
    deleted: false,
    approved: true
  } : {};
  try { 
    for (const key in queryObj) {
      if (array.includes(String(key))) {
        obj[key] = queryObj[key];
      }
    }
  } catch (error) {
    console.log(error)
  }
  return obj;
};