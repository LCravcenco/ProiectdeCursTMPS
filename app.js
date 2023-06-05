// Singleton
class Library {
  constructor() {
    if (Library.instance) {
      return Library.instance;
    }

    this.books = new Map();
    Library.instance = this;
  }

  addBook(book) {
    this.books.set(book.isbn, book);
  }

  removeBook(isbn) {
    this.books.delete(isbn);
  }

  getBook(isbn) {
    return this.books.get(isbn);
  }

  search(query) {
    const lowerCaseQuery = query.toLowerCase();
    const searchResult = Array.from(this.books.values()).filter((book) => {
      return (
        book.title.toLowerCase().includes(lowerCaseQuery) ||
        book.author.toLowerCase().includes(lowerCaseQuery)
      );
    });
    return searchResult;
  }
}

// Builder
class BookBuilder {
  constructor() {
    this.book = {};
  }

  setTitle(title) {
    this.book.title = title;
    return this;
  }

  setAuthor(author) {
    this.book.author = author;
    return this;
  }

  setIsbn(isbn) {
    this.book.isbn = isbn;
    return this;
  }

  build() {
    return new Book(this.book);
  }
}

// Base class
class Book {
  constructor({ title, author, isbn }) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }

  display() {
    return `${this.title} by ${this.author} (ISBN: ${this.isbn})`;
  }
}

// Subclass for LSP
class SpecialBook extends Book {
  display() {
    return `Special: ${super.display()}`;
  }
}

// Adapter
class BookAdapter {
  constructor(book) {
    this.book = book;
  }

  getDisplayTitle() {
    return this.book.display();
  }
}

// Bridge
class BookDisplay {
  constructor(displayImplementation) {
    this.displayImplementation = displayImplementation;
  }

  display(book) {
    return this.displayImplementation.display(book);
  }
}

class ConsoleDisplay {
  display(book) {
    return book.display();
  }
}

// Command
class Command {
  execute() {
    throw new Error('Method execute() must be implemented');
  }
}

class AddBookCommand extends Command {
  constructor(library, book) {
    super();
    this.library = library;
    this.book = book;
  }

  execute() {
    this.library.addBook(this.book);
  }
}

class RemoveBookCommand extends Command {
  constructor(library, isbn) {
    super();
    this.library = library;
    this.isbn = isbn;
  }

  execute() {
    this.library.removeBook(this.isbn);
  }
}

// Interpreter
class Interpreter {
  constructor(library) {
    this.library = library;
  }

  interpret(input) {
    const tokens = input.split(' ');
    const command = tokens[0].toLowerCase();

    if (command === 'add') {
      const title = tokens[1];
      const author = tokens[2];
      const isbn = tokens[3];

      const bookBuilder = new BookBuilder();
      const book = bookBuilder
        .setTitle(title)
        .setAuthor(author)
        .setIsbn(isbn)
        .build();

      const addBookCommand = new AddBookCommand(this.library, book);
      addBookCommand.execute();
    } else if (command === 'remove') {
      const isbn = tokens[1];
      const removeBookCommand = new RemoveBookCommand(this.library, isbn);
      removeBookCommand.execute();
    } else {
      console.log('Invalid command');
    }
  }
}

// Sample usage
const library = new Library();

const bookBuilder = new BookBuilder();
const book1 = bookBuilder
  .setTitle('Măștile fricii')
  .setAuthor('Camelia Cavadia')
  .setIsbn('1234567890')
  .build();

library.addBook(book1);

const display = new BookDisplay(new ConsoleDisplay());
console.log(display.display(book1));

const bookAdapter = new BookAdapter(book1);
console.log(bookAdapter.getDisplayTitle());

const interpreter = new Interpreter(library);
interpreter.interpret('add Oamenii_din_Dublin James_Joyce 0987654321');

console.log(library.getBook('0987654321'));

// Event listeners and utility functions
document.getElementById('addBook').addEventListener('click', (event) => {
  event.preventDefault();
  const titleElement = document.getElementById('title');
  const authorElement = document.getElementById('author');
  const isbnElement = document.getElementById('isbn');

  if (titleElement && authorElement && isbnElement) {
    const title = titleElement.value;
    const author = authorElement.value;
    const isbn = isbnElement.value;

    const bookBuilder = new BookBuilder();
    const book = bookBuilder.setTitle(title).setAuthor(author).setIsbn(isbn).build();

    const addBookCommand = new AddBookCommand(library, book);
    addBookCommand.execute();

    displayBookList();
    clearForm();
  } else {
    console.log('Elemente lipsă în DOM');
  }
});

document.getElementById('searchButton').addEventListener('click', (event) => {
  event.preventDefault();
  const searchQueryElement = document.getElementById('searchQuery');

  if (searchQueryElement) {
    const searchQuery = searchQueryElement.value;
    const searchResults = library.search(searchQuery);
    displayBookList(searchResults);
  } else {
    console.log('Elementul searchQuery lipsă în DOM');
  }
});

document.getElementById('clearAllBooks').addEventListener('click', () => {
  library.books.clear();
  displayBookList();
});

function displayBookList(booksToDisplay = Array.from(library.books.values())) {
  const bookListContainer = document.getElementById('bookListContainer');
  bookListContainer.innerHTML = '';

  for (const book of booksToDisplay) {
    const bookAdapter = new BookAdapter(book);
    const displayTitle = bookAdapter.getDisplayTitle();

    const listItem = document.createElement('li');
    listItem.textContent = displayTitle;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const removeBookCommand = new RemoveBookCommand(library, book.isbn);
      removeBookCommand.execute();
      displayBookList();
    });

    listItem.appendChild(removeButton);
    bookListContainer.appendChild(listItem);
  }
}

function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('isbn').value = '';
}

displayBookList();
