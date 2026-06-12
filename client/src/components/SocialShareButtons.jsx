import React, { useState } from 'react';
import {
    FacebookShareButton,
    WhatsappShareButton,
    EmailShareButton,
} from 'react-share';

import {
    FaFacebook,
    FaWhatsapp,
    FaEnvelope,
    FaLink,
    FaCheckCircle,
} from 'react-icons/fa';

function SocialShareButtons({ url, title }) {
    const [copied, setCopied] = useState(false);
    const iconSize = 20;
    const shareIconSize = 30;

    const buttonClass =
        'p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <h3 className="font-semibold text-lg text-gray-800">Condividi:</h3>
            <div className="flex items-center gap-2 flex-wrap">

                {/* Copia link */}
                <button onClick={handleCopyLink} className={buttonClass} title="Copia link">
                    {copied
                        ? <FaCheckCircle size={iconSize} color="#22c55e"/>
                        : <FaLink size={iconSize} color="#6b7280"/>
                    }
                </button>

                {/* WhatsApp */}
                <WhatsappShareButton url={url} title={title} className={buttonClass}>
                    <FaWhatsapp size={shareIconSize} color="#25D366"/>
                </WhatsappShareButton>

                {/* Facebook */}
                <FacebookShareButton url={url} quote={title} className={buttonClass}>
                    <FaFacebook size={shareIconSize} color="#1877F2"/>
                </FacebookShareButton>

                {/* Email */}
                <EmailShareButton
                    url={url}
                    subject={title}
                    body={`Dai un'occhiata: ${url}`}
                    className={buttonClass}
                >
                    <FaEnvelope size={shareIconSize} color="#EA4335"/>
                </EmailShareButton>
            </div>
        </div>
    );
}

export default SocialShareButtons;
