import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


function NewsPreviewCard({ news }) {


    const displayImage = news.imageUrl || `https://ui-avatars.com/api/?name=${news.title.replace(/\s/g, '+')}&size=400&background=e0f2fe&color=0891b2`;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
        >
            {/* Il link ora punta dinamicamente alla pagina di dettaglio */}
            <Link to={`/notizie/${news.id}`}>
                <div className="overflow-hidden aspect-video">
                    <img
                        src={displayImage}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-sky-600 transition-colors">
                        {news.title}
                    </h3>
                    {/* Opzionale: Aggiungi un piccolo estratto se presente */}
                    {news.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {news.excerpt}
                        </p>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

export default NewsPreviewCard;