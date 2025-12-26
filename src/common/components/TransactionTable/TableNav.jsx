import React from "react";
import { BsFunnel, BsPlusLg, BsSearch, BsTrash } from "react-icons/bs";
import { Link } from "react-router-dom";

const TransactionHeader = ({
  deleteAble = false,
  query = "",
  setQuery = () => {},
  handleDelete = () => {},
  showFilter = () => {},
  isLoading = true,
}) => {
  return (
    <div className="table_nav mb-5">
      {/* <!-- table search --> */}
      <div className="table_nav_search">
        <label htmlFor="transaction-search" className="sr-only">
          Search transactions
        </label>
        <input
          id="transaction-search"
          type="search"
          placeholder="search.."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-input"
          aria-label="Search transactions"
        />

        <BsSearch className=" icon" aria-hidden="true"></BsSearch>
      </div>

      {/* <!-- table actions --> */}
      <div className={`table_nav_actions`}>
        <Link
          className={`btn btn-icon btn-success`}
          to={"/transactions/create"}
          disabled={isLoading}
          aria-label="Create new transaction"
        >
          <BsPlusLg aria-hidden="true" />
        </Link>
        <button
          disabled={isLoading}
          className={`btn btn-icon btn-warning`}
          onClick={showFilter}
          aria-label="Open filters"
        >
          <BsFunnel aria-hidden="true" />
        </button>

        {deleteAble && (
          <button
            disabled={isLoading}
            className={`btn btn-icon btn-danger font-medium`}
            onClick={handleDelete}
            aria-label="Delete selected transactions"
          >
            <BsTrash aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionHeader;
