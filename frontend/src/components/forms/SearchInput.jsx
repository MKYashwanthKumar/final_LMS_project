import { Search } from "lucide-react";

const SearchInput = ({ placeholder = "Search..." }) => {
  return (
    <div className="search-box">
      <Search size={16} />
      <input type="text" placeholder={placeholder} />
    </div>
  );
};

export default SearchInput;