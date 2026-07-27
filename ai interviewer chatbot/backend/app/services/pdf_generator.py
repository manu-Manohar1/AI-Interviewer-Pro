from io import BytesIO

from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

PAGE_WIDTH = 515  # Printable width for A4 with 40pt margins (595 - 80)


def create_progress_bar(title, score):
    """Creates a horizontal progress bar showing scores as percentages out of 100%."""
    drawing = Drawing(PAGE_WIDTH, 24)

    # Title
    drawing.add(
        String(
            0,
            8,
            title,
            fontName="Helvetica-Bold",
            fontSize=10,
        )
    )

    # Background track (width = 220pt)
    drawing.add(
        Rect(
            130,
            5,
            220,
            10,
            fillColor=colors.HexColor("#E5E7EB"),
            strokeColor=colors.HexColor("#E5E7EB"),
        )
    )

    # Clamp score safely between 0 and 10
    clamped_score = min(max(score, 0), 10)

    # Choose color based on score
    if clamped_score >= 9:
        bar_color = colors.HexColor("#16A34A")
    elif clamped_score >= 8:
        bar_color = colors.HexColor("#2563EB")
    elif clamped_score >= 6:
        bar_color = colors.HexColor("#F59E0B")
    else:
        bar_color = colors.HexColor("#DC2626")

    # Filled portion (Max width = 220pt for score = 10)
    filled_width = clamped_score * 22
    drawing.add(
        Rect(
            130,
            5,
            filled_width,
            10,
            fillColor=bar_color,
            strokeColor=bar_color,
        )
    )

    # Score Label as Percentage
    percentage_str = f"{int(round(clamped_score * 10))}%"
    drawing.add(
        String(
            365,
            8,
            percentage_str,
            fontName="Helvetica-Bold",
            fontSize=10,
        )
    )

    return drawing


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.grey)
    canvas.drawString(20 * mm, 10 * mm, "AI Interviewer Pro")
    canvas.drawRightString(190 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()


def create_kpi_card(title, value, bg_color, body_style, width=250):
    """Creates a single KPI card designed to fit proportionally inside a grid."""
    table = Table(
        [
            [
                Paragraph(
                    f"""
                <para align='center'>
                <font color='white' size='10'><b>{title}</b></font><br/>
                <font color='white' size='18'><b>{value}</b></font>
                </para>
                """,
                    body_style,
                )
            ]
        ],
        colWidths=[width],
        rowHeights=[60],
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg_color)),
                ("BOX", (0, 0), (-1, -1), 1, colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    return table


def build_card_block(title, content_text, bg_hex, border_hex, normal_style):
    """Helper function to create styled full-width block containers."""
    table = Table(
        [
            [
                Paragraph(
                    f"<b>{title}</b><br/><br/>{content_text}",
                    normal_style,
                )
            ]
        ],
        colWidths=[PAGE_WIDTH],
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg_hex)),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(border_hex)),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ]
        )
    )
    return table


def generate_interview_report(user, interview):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=(595, 842),  # A4
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER
    title_style.fontSize = 24
    title_style.textColor = colors.white

    heading_style = styles["Heading2"]
    heading_style.textColor = colors.HexColor("#1E3A8A")
    heading_style.fontSize = 14
    heading_style.leading = 18

    normal_style = styles["BodyText"]
    normal_style.fontSize = 10
    normal_style.leading = 16

    elements = []

    # =====================================================
    # HEADER
    # =====================================================
    header = Table(
        [
            [
                Paragraph(
                    "<font size='22'><b>AI Interviewer Pro</b></font><br/>"
                    "<font size='11'>Professional AI Interview Assessment Report</font>",
                    title_style,
                )
            ]
        ],
        colWidths=[PAGE_WIDTH],
    )

    header.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#2563EB")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 18),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
            ]
        )
    )

    elements.append(header)
    elements.append(Spacer(1, 0.20 * inch))

    elements.append(
        Paragraph(
            "<b>Professional Interview Assessment Report</b>",
            heading_style,
        )
    )

    elements.append(Spacer(1, 0.20 * inch))

    # =====================================================
    # OVERALL RATING & BADGE
    # =====================================================
    overall = getattr(interview, "overall_score", 0.0)

    if overall >= 9:
        rating = "Excellent"
        rating_color = "#16A34A"
    elif overall >= 8:
        rating = "Very Good"
        rating_color = "#2563EB"
    elif overall >= 6:
        rating = "Good"
        rating_color = "#F59E0B"
    else:
        rating = "Needs Improvement"
        rating_color = "#DC2626"

    rating_badge = Table(
        [
            [
                Paragraph(
                    f"<font color='white'><b>{rating}</b></font>",
                    normal_style,
                )
            ]
        ],
        colWidths=[150],
    )

    rating_badge.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(rating_color)),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("BOX", (0, 0), (-1, -1), 1, colors.white),
            ]
        )
    )

    # =====================================================
    # EXECUTIVE DASHBOARD
    # =====================================================
    tech_score = getattr(interview, "technical_score", 0.0)
    comm_score = getattr(interview, "communication_score", 0.0)
    conf_score = getattr(interview, "confidence_score", 0.0)
    rel_score = getattr(interview, "relevance_score", 0.0)
    gram_score = getattr(interview, "grammar_score", 0.0)

    card_width = 252.5  # Fits perfectly in 515pt total printable space (252.5 * 2 = 505pt)

    dashboard = Table(
        [
            [
                create_kpi_card("Overall Score", f"{overall:.1f}/10", "#2563EB", normal_style, width=card_width),
                create_kpi_card("Technical", f"{tech_score:.1f}/10", "#16A34A", normal_style, width=card_width),
            ],
            [
                create_kpi_card("Communication", f"{comm_score:.1f}/10", "#F59E0B", normal_style, width=card_width),
                create_kpi_card("Confidence", f"{conf_score:.1f}/10", "#7C3AED", normal_style, width=card_width),
            ],
        ],
        colWidths=[card_width, card_width],
    )

    dashboard.setStyle(
        TableStyle(
            [
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    elements.append(dashboard)
    elements.append(Spacer(1, 0.15 * inch))
    elements.append(rating_badge)
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # CANDIDATE SUMMARY
    # =====================================================
    user_name = getattr(user, "name", None) or "N/A"
    user_email = getattr(user, "email", None) or "N/A"

    summary_data = [
        [
            Paragraph("<b>Candidate</b>", normal_style),
            Paragraph(user_name, normal_style),
            Paragraph("<b>Overall Score</b>", normal_style),
            Paragraph(f"{overall:.2f}/10", normal_style),
        ],
        [
            Paragraph("<b>Email</b>", normal_style),
            Paragraph(user_email, normal_style),
            Paragraph("<b>Status</b>", normal_style),
            Paragraph("Completed", normal_style),
        ],
        [
            Paragraph("<b>Assessment</b>", normal_style),
            Paragraph("AI Interview", normal_style),
            Paragraph("<b>Rating</b>", normal_style),
            Paragraph(rating, normal_style),
        ],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[95, 162, 95, 163],
    )

    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#DBEAFE")),
                ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#DBEAFE")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    elements.append(summary_table)
    elements.append(Spacer(1, 0.20 * inch))

    # =====================================================
    # INTERVIEW STATISTICS
    # =====================================================
    elements.append(
        Paragraph(
            "<b>Interview Statistics</b>",
            heading_style,
        )
    )
    elements.append(Spacer(1, 0.08 * inch))

    stats_data = [
        [Paragraph("<b>Metric</b>", normal_style), Paragraph("<b>Value</b>", normal_style)],
        [Paragraph("Overall Score", normal_style), Paragraph(f"{overall:.2f}/10", normal_style)],
        [Paragraph("Technical Score", normal_style), Paragraph(f"{tech_score:.2f}/10", normal_style)],
        [Paragraph("Communication Score", normal_style), Paragraph(f"{comm_score:.2f}/10", normal_style)],
        [Paragraph("Confidence Score", normal_style), Paragraph(f"{conf_score:.2f}/10", normal_style)],
        [Paragraph("Relevance Score", normal_style), Paragraph(f"{rel_score:.2f}/10", normal_style)],
        [Paragraph("Grammar Score", normal_style), Paragraph(f"{gram_score:.2f}/10", normal_style)],
        [Paragraph("Report ID", normal_style), Paragraph(f"#{getattr(interview, 'id', 'N/A')}", normal_style)],
    ]

    stats_table = Table(
        stats_data,
        colWidths=[257.5, 257.5],
    )

    stats_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    elements.append(stats_table)
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # PERFORMANCE DASHBOARD
    # =====================================================
    elements.append(
        Paragraph(
            "<b>Performance Dashboard</b>",
            heading_style,
        )
    )

    elements.append(Spacer(1, 0.12 * inch))
    elements.append(create_progress_bar("Technical", tech_score))
    elements.append(Spacer(1, 0.08 * inch))
    elements.append(create_progress_bar("Communication", comm_score))
    elements.append(Spacer(1, 0.08 * inch))
    elements.append(create_progress_bar("Confidence", conf_score))
    elements.append(Spacer(1, 0.08 * inch))
    elements.append(create_progress_bar("Relevance", rel_score))
    elements.append(Spacer(1, 0.08 * inch))
    elements.append(create_progress_bar("Grammar", gram_score))
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # TOP 3 RANKED STRENGTHS
    # =====================================================
    category_scores = [
        ("Technical Knowledge", tech_score),
        ("Communication", comm_score),
        ("Confidence", conf_score),
        ("Relevance", rel_score),
        ("Grammar", gram_score),
    ]

    # Sort categories descending and take top 3
    sorted_strengths = sorted(category_scores, key=lambda x: x[1], reverse=True)[:3]

    if sorted_strengths:
        strength_list = [
            f"{idx + 1}. {title} ({score:.1f})"
            for idx, (title, score) in enumerate(sorted_strengths)
        ]
        strength_text = "<br/>".join(strength_list)
    else:
        strength_text = "Continue practicing to build stronger interview skills."

    elements.append(
        build_card_block(
            "Top Strengths",
            strength_text,
            "#ECFDF5",
            "#22C55E",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # TOP 3 RANKED IMPROVEMENTS
    # =====================================================
    # Sort categories ascending and take top 3 weakest
    sorted_weaknesses = sorted(category_scores, key=lambda x: x[1])[:3]

    if sorted_weaknesses:
        weakness_list = [
            f"{idx + 1}. {title} ({score:.1f})"
            for idx, (title, score) in enumerate(sorted_weaknesses)
        ]
        weakness_text = "<br/>".join(weakness_list)
    else:
        weakness_text = "Excellent overall performance across all categories."

    elements.append(
        build_card_block(
            "Priority Improvements",
            weakness_text,
            "#FEFCE8",
            "#EAB308",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # INTERVIEW QUESTION
    # =====================================================
    elements.append(
        Paragraph(
            "<b>Interview Question</b>",
            heading_style,
        )
    )
    elements.append(Spacer(1, 0.08 * inch))

    question = getattr(interview, "question", None) or "No question provided."
    elements.append(
        build_card_block(
            "Question Details",
            question,
            "#F8FAFC",
            "#CBD5E1",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # CANDIDATE ANSWER
    # =====================================================
    elements.append(
        Paragraph(
            "<b>Candidate Answer</b>",
            heading_style,
        )
    )
    elements.append(Spacer(1, 0.08 * inch))

    answer = getattr(interview, "answer", None) or "No answer provided."
    elements.append(
        build_card_block(
            "Response",
            answer,
            "#F8FAFC",
            "#CBD5E1",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # AI FEEDBACK
    # =====================================================
    elements.append(
        Paragraph(
            "<b>AI Feedback</b>",
            heading_style,
        )
    )
    elements.append(Spacer(1, 0.08 * inch))

    feedback = getattr(interview, "feedback_text", None) or "No feedback available."
    elements.append(
        build_card_block(
            "Evaluation & Analysis",
            feedback,
            "#EFF6FF",
            "#2563EB",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # PERFORMANCE SUMMARY
    # =====================================================
    summary_points = []
    if tech_score >= 8:
        summary_points.append("strong technical knowledge")
    if comm_score >= 8:
        summary_points.append("clear communication")
    if conf_score >= 8:
        summary_points.append("high confidence")
    if rel_score >= 8:
        summary_points.append("relevant responses")
    if gram_score >= 8:
        summary_points.append("excellent grammar")

    strengths_summary_text = ", ".join(summary_points) if summary_points else "basic interview skills"

    improvements = []
    if tech_score < 8:
        improvements.append("technical depth")
    if comm_score < 8:
        improvements.append("communication")
    if conf_score < 8:
        improvements.append("confidence")
    if rel_score < 8:
        improvements.append("answer relevance")
    if gram_score < 8:
        improvements.append("grammar")

    improvement_summary_text = (
        ", ".join(improvements) if improvements else "continue practicing advanced interview questions"
    )

    performance_summary = f"""
The candidate demonstrated <b>{strengths_summary_text}</b> during the interview.<br/><br/>
The primary areas that would benefit from further improvement are <b>{improvement_summary_text}</b>.<br/><br/>
Overall Score: <b>{overall:.2f}/10</b>
"""

    elements.append(
        build_card_block(
            "Overall Assessment",
            performance_summary,
            "#F0F9FF",
            "#0EA5E9",
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.25 * inch))

    # =====================================================
    # FINAL HIRING RECOMMENDATION
    # =====================================================
    if overall >= 9:
        hiring_result = "Highly Recommended"
        hiring_color = "#16A34A"
        hiring_reason = (
            "The candidate demonstrated excellent technical knowledge, "
            "strong communication skills, and high confidence."
        )
    elif overall >= 8:
        hiring_result = "Recommended"
        hiring_color = "#22C55E"
        hiring_reason = (
            "The candidate performed well across most evaluation areas "
            "with only minor improvements needed."
        )
    elif overall >= 6:
        hiring_result = "Consider After Improvement"
        hiring_color = "#F59E0B"
        hiring_reason = (
            "The candidate has potential but should improve weaker areas "
            "before being considered."
        )
    else:
        hiring_result = "Not Recommended"
        hiring_color = "#DC2626"
        hiring_reason = (
            "The current interview performance does not meet the expected "
            "requirements for the role."
        )

    practice = []
    if tech_score < 8:
        practice.append("- Strengthen technical concepts and problem solving.")
    if comm_score < 8:
        practice.append("- Improve communication clarity and structure.")
    if conf_score < 8:
        practice.append("- Practice speaking confidently during interviews.")
    if rel_score < 8:
        practice.append("- Keep answers focused on the interview question.")
    if gram_score < 8:
        practice.append("- Improve grammar and sentence construction.")

    if not practice:
        practice.append("- Continue practicing with advanced interview questions.")

    practice_text = "<br/>".join(practice)

    recommendation = f"""
<b>{hiring_result}</b><br/><br/>
<b>Reason</b><br/>
{hiring_reason}<br/><br/>
<b>Suggested Practice</b><br/>
{practice_text}
"""

    elements.append(
        build_card_block(
            f'<font color="{hiring_color}">Recommendation</font>',
            recommendation,
            "#F8FAFC",
            hiring_color,
            normal_style,
        )
    )
    elements.append(Spacer(1, 0.30 * inch))

    # =====================================================
    # FOOTER
    # =====================================================
    report_id = getattr(interview, "id", "N/A")

    footer_text = f"""
    <para align='center'>
    <font color="white">Generated by AI Interviewer Pro</font><br/>
    <font color="white">Professional Interview Assessment Report</font><br/>
    <font color="white">Version 1.0</font><br/>
    <font color="white">Report ID #{report_id}</font><br/>
    <font color="white">Confidential Assessment Report</font>
    </para>
    """

    footer = Table(
        [[Paragraph(footer_text, normal_style)]],
        colWidths=[PAGE_WIDTH],
    )

    footer.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1E3A8A")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )

    elements.append(footer)
    elements.append(Spacer(1, 0.15 * inch))

    elements.append(
        Paragraph(
            "<para align='center'>"
            "<font size='8' color='#6B7280'>"
            "AI Interviewer Pro | Professional Interview Assessment Report"
            "</font>"
            "</para>",
            normal_style,
        )
    )

    # =====================================================
    # BUILD PDF
    # =====================================================
    doc.build(
        elements,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number,
    )

    pdf = buffer.getvalue()
    buffer.close()

    return pdf