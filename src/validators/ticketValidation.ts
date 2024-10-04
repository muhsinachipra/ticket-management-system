import { body } from 'express-validator';
import moment from "moment";

export const createTicketValidation = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),

    body('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),

    body('type')
        .notEmpty().withMessage('Type is required')
        .isIn(['concert', 'conference', 'sports']).withMessage('Type must be one of concert, conference, sports'),

    body('venue')
        .notEmpty().withMessage('Venue is required')
        .isString().withMessage('Venue must be a string')
        .isLength({ max: 255 }).withMessage('Venue must not exceed 255 characters'),

    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['open', 'in-progress', 'closed']).withMessage('Status must be one of open, in-progress, closed'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number'),

    body('priority')
        .notEmpty().withMessage('Priority is required')
        .isIn(['low', 'medium', 'high']).withMessage('Priority must be one of low, medium, high'),

    body('dueDate')
        .notEmpty().withMessage('Due date is required')
        .isISO8601().withMessage('Due date must be a valid ISO 8601 date string')
        .custom((value) => {
            if (!moment(value).isAfter(new Date())) {
                throw new Error('Due date must be in the future');
            }
            return true;
        }),
];
