

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomeCard({ icon, title, description, linkTo }) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full"
        >
            <Link to={linkTo} className="block bg-white rounded-xl shadow-lg p-6 text-center h-full">
                <div className="flex justify-center items-center mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="mt-2 text-gray-500">{description}</p>
            </Link>
        </motion.div>
    );
}

export default HomeCard;