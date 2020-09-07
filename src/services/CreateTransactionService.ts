import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}

class CreateTransactionService {
  public async execute({ title, value, type, category: categoryTitle }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository)

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance.');
    }

    let category = await categoriesRepository.findOne({
      where: { title: categoryTitle }
    })
    if (!category) {
      category = categoriesRepository.create({
        title: categoryTitle,
      })
      await categoriesRepository.save(category)
    }
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: category
    })

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
