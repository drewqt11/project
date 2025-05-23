package com.apas.website.utilities;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;

/**
 * Custom Hibernate ID generator for PDF IDs.
 * Generates IDs in the format "PDF_XXXX_XXXX" where X is a random alphanumeric character (0-9, A-Z).
 */
public class PdfIdGenerator implements IdentifierGenerator {

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        return CustomIdGenerator.generatePdfId();
    }
} 