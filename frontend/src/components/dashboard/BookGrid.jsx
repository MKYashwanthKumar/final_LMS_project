const BookGrid = ({ books = [], actionLabel = "Open" }) => {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <div className="book-card" key={`${book.title}-${book.isbn}`}>
          <div className="book-meta-top">
            <span>{book.category}</span>
            <small>{book.availability}</small>
          </div>
          <h4>{book.title}</h4>
          <p>by {book.author}</p>
          <span className="isbn">ISBN: {book.isbn}</span>
          <button className="btn-primary full small-gap">{actionLabel}</button>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;