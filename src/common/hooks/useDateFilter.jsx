import { useEffect, useState } from "react";

const useDateFilter = (transactions) => {
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date());
  const [filterType, setFilterType] = useState("MONTH");

  // update filter date
  useEffect(() => {
    setFilterDate(new Date());
  }, [filterType]);

  // update filter data
  useEffect(() => {
    if (transactions) {
      switch (filterType) {
        case "NONE":
          setData(transactions);
          break;
        case "MONTH":
          setData(
            transactions?.filter((t) => {
              const tDate = new Date(t.date);
              return (
                tDate.getMonth() === filterDate.getMonth() &&
                tDate.getFullYear() === filterDate.getFullYear()
              );
            })
          );
          break;
        case "YEAR":
          setData(
            transactions.filter((t) => {
              const tDate = new Date(t.date);
              return tDate.getFullYear() === filterDate.getFullYear();
            })
          );
          break;
        default:
          break;
      }
    }
  }, [transactions, filterDate]);

  return {
    filteredData: data,
    filterDate,
    filterType,
    setFilterDate,
    setFilterType,
  };
};

export default useDateFilter;
