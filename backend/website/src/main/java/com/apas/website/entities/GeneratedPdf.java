package com.apas.website.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "generated_pdfs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedPdf {

    @SuppressWarnings("deprecation") // Suppress warning for GenericGenerator
    @Id
    @GenericGenerator(name = "pdf_id_generator", strategy = "com.apas.website.utilities.PdfIdGenerator")
    @GeneratedValue(generator = "pdf_id_generator")
    @Column(name = "pdf_id", updatable = false, nullable = false, columnDefinition = "VARCHAR(20)")
    private String pdfId; // Changed from UUID id to String pdfId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    @JsonBackReference("portfolio-generatedPdfs")
    private PortfolioEntity portfolio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-generatedPdfs")
    private UserEntity user;

    @Column(name = "custom_display_name")
    private String customDisplayName; // New field for user-defined PDF name

    @Column(name = "original_portfolio_title")
    private String originalPortfolioTitle;

    @Column(nullable = false)
    private String filename;

    @Column(name = "generated_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime generatedAt;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Lob
    @Column(name = "pdf_content")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] pdfContent; // For storing PDF directly, suitable for smaller files

    @Column(name = "storage_path")
    private String storagePath; // For storing path if using external storage like Supabase Storage

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "style_options", columnDefinition = "jsonb")
    private Map<String, Object> styleOptions; // To store PdfGenerationRequest
} 