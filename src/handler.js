const { nanoid } = require('nanoid');
const books = require('./books');

const validateInput = (payload, type = 'create') => {
    const { name, pageCount, readPage } = payload;

    let messageType = type === 'update' ? 'memperbarui' : 'menambahkan';

    if (!name) {
        return {
            status: false,
            message: `Gagal ${messageType} buku. Mohon isi nama buku`
        };
    }

    if (readPage > pageCount) {
        return {
            status: false,
            message: `Gagal ${messageType} buku. readPage tidak boleh lebih besar dari pageCount`
        };
    }

    return {
        status: true
    };
};

const addBookHandler = (request, h) => {
    const payload = request.payload;

    const validation = validateInput(payload);

    if (!validation.status) {
        return h.response({
            status: 'fail',
            message: validation.message
        }).code(400)
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = payload.pageCount === payload.readPage;

    const newBook = {
        id, ...payload, finished, insertedAt, updatedAt,
    };

    books.push(newBook);

    const isSuccess = books.find((book) => book.id === id);

    if (isSuccess) {
        return h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        }).code(201);
    }

    return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku.',
    }).code(500);

};

const getBooksHandler = (request, h) => {
    const filters = request.query;

    let filteredBooks = [...books];

    if (filters.name) {
        filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.reading === '0' || filters.reading === '1') {
        const isReading = filters.reading === '1';
        filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    if (filters.finished === '0' || filters.finished === '1') {
        const isFinished = filters.finished === '1';
        filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }


    filteredBooks = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));

    return h.response({
        status: 'success',
        data: {
            books: filteredBooks,
        },
    }).code(200);

};

const getBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const book = books.find((book) => book.id === id)

    if (book) {
        return {
            status: 'success',
            data: {
                book,
            },
        };
    }

    return h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    }).code(404)

};

const editBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const payload = request.payload;

    const validation = validateInput(payload, 'update');

    if (!validation.status) {
        return h.response({
            'status': 'fail',
            'message': validation.message
        }).code(400)
    }

    const index = books.findIndex((book) => book.id === id);

    if (index === -1) {
        return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
    }

    const updatedAt = new Date().toISOString();

    books[index] = {
        ...books[index],
        ...payload,
        updatedAt,
    };
    return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
    }).code(200);

};

const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const index = books.findIndex((book) => book.id === id);

    if (index === -1) {
        return h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
    }

    books.splice(index, 1);

    return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
    }).code(200);

};

module.exports = {
    addBookHandler,
    getBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};
