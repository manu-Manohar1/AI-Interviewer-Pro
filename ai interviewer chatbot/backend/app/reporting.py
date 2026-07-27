from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.linecharts import HorizontalLineChart


def _build_progress_chart(values):
    drawing = Drawing(4 * inch, 2.2 * inch)

    chart = HorizontalLineChart()
    chart.x = 0.4 * inch
    chart.y = 0.3 * inch
    chart.width = 3.2 * inch
    chart.height = 1.3 * inch

    chart.data = [values]

    chart.lines[0].strokeColor = colors.HexColor("#4f46e5")
    chart.lines[0].strokeWidth = 2

    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 10
    chart.valueAxis.labelTextFormat = "%s"

    chart.categoryAxis.labels = [
        str(i + 1) for i in range(len(values))
    ]
    chart.categoryAxis.visible = False

    drawing.add(chart)

    return drawing


def build_session_report_pdf(
    session,
    responses,
    weak_topics=None,
    progress=None,
):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        title=f"Interview Report {session.get('id','')}",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=26,
        textColor=colors.HexColor("#2563eb"),
        spaceAfter=18,
    )

    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#1e40af"),
        spaceBefore=10,
        spaceAfter=8,
    )

    body_style = styles["BodyText"]

    story = []

    metric_names = [
        "technical_score",
        "communication_score",
        "confidence_score",
        "relevance_score",
        "grammar_score",
        "overall_score",
    ]

    if responses:
        score_values = {}

        for metric in metric_names:
            vals = [
                item.get(metric, 0)
                for item in responses
                if item.get(metric) is not None
            ]

            score_values[metric] = (
                round(sum(vals) / len(vals), 2)
                if vals
                else 0
            )

    else:
        score_values = {
            metric: 0
            for metric in metric_names
        }

    # ==========================
    # COVER PAGE
    # ==========================

    story.append(
        Paragraph(
            "🤖 AI Interviewer Pro",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "Candidate Assessment Report",
            heading_style,
        )
    )

    story.append(Spacer(1, 0.2 * inch))

    candidate_rows = [
        ["Candidate", session.get("candidate", "Unknown")],
        ["Job Role", session.get("role", "AI Interview")],
        ["Interview Date", session.get("date", "N/A")],
        ["Report ID", f"AI-{session.get('id','0000')}"],
    ]

    candidate_table = Table(
        candidate_rows,
        colWidths=[2 * inch, 4 * inch],
    )

    candidate_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#2563eb"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (0, -1),
                    colors.white,
                ),
                (
                    "BACKGROUND",
                    (1, 0),
                    (1, -1),
                    colors.whitesmoke,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    10,
                ),
            ]
        )
    )

    story.append(candidate_table)

    story.append(Spacer(1, 0.3 * inch))

    # ==========================
    # EXECUTIVE SUMMARY
    # ==========================

    story.append(
        Paragraph(
            "Executive Summary",
            heading_style,
        )
    )

    overall = score_values["overall_score"]

    recommendation = "🔴 Needs Improvement"

    if overall >= 8.5:
        recommendation = "🟢 Strong Hire"
    elif overall >= 7:
        recommendation = "🟡 Hire"
    elif overall >= 5:
        recommendation = "🟠 Consider"

    summary_rows = [
        ["Overall Score", f"{overall}/10"],
        ["Recommendation", recommendation],
        ["Questions", str(len(responses))],
    ]

    summary_table = Table(summary_rows)

    summary_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#4f46e5"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (0, -1),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    story.append(summary_table)

    story.append(Spacer(1, 0.25 * inch))
    # ==========================
    # PERFORMANCE SCORE TABLE
    # ==========================

    story.append(
        Paragraph(
            "Performance Score",
            heading_style,
        )
    )

    score_rows = [
        ["Metric", "Score (/10)"],
        ["Technical", score_values["technical_score"]],
        ["Communication", score_values["communication_score"]],
        ["Confidence", score_values["confidence_score"]],
        ["Relevance", score_values["relevance_score"]],
        ["Grammar", score_values["grammar_score"]],
        ["Overall", score_values["overall_score"]],
    ]

    score_table = Table(
        score_rows,
        colWidths=[3 * inch, 2 * inch],
    )

    score_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story.append(score_table)

    story.append(Spacer(1, 0.25 * inch))

    # ==========================
    # QUESTION ANALYSIS
    # ==========================

    story.append(
        Paragraph(
            "Question Analysis",
            heading_style,
        )
    )

    if responses:

        for index, item in enumerate(responses, start=1):

            story.append(
                Paragraph(
                    f"<b>Question {index}</b>",
                    styles["Heading3"],
                )
            )

            story.append(
                Paragraph(
                    f"<b>Question:</b> {item.get('question') or 'N/A'}",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    f"<b>Answer:</b> {item.get('answer') or 'N/A'}",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    f"<b>Overall Score:</b> {item.get('overall_score',0)}/10",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    f"<b>Feedback:</b> {item.get('feedback_text') or 'No feedback provided.'}",
                    body_style,
                )
            )

            story.append(Spacer(1, 0.15 * inch))

    else:

        story.append(
            Paragraph(
                "No interview responses available.",
                body_style,
            )
        )

    # ==========================
    # WEAK TOPICS
    # ==========================

    story.append(
        Paragraph(
            "Weak Topics",
            heading_style,
        )
    )

    weak_topics = weak_topics or []

    if weak_topics:

        for topic in weak_topics:

            story.append(
                Paragraph(
                    f"• {topic.get('type','Unknown')} "
                    f"({topic.get('avg_score',0)}/10)",
                    body_style,
                )
            )

    else:

        story.append(
            Paragraph(
                "No weak topics identified.",
                body_style,
            )
        )

    story.append(Spacer(1, 0.25 * inch))

    # ==========================
    # PROGRESS CHART
    # ==========================

    story.append(
        Paragraph(
            "Progress Snapshot",
            heading_style,
        )
    )

    values = []

    if progress:

        values = [
            float(item.get("overall", 0) or 0)
            for item in progress
            if item.get("overall") is not None
        ]

    if not values:

        values = [
            item.get("overall_score", 0)
            for item in responses
        ]

    if not values:
        values = [0]

    story.append(_build_progress_chart(values))

    story.append(Spacer(1, 0.3 * inch))

    # ==========================
    # FINAL SUMMARY
    # ==========================

    story.append(
        Paragraph(
            "Final Summary",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            "Thank you for completing the AI Interview. "
            "This report summarizes your interview performance "
            "and highlights your strengths and improvement areas. "
            "Continue practicing consistently to improve your "
            "technical knowledge, communication skills, and confidence.",
            body_style,
        )
    )

    doc.build(story)

    buffer.seek(0)

    return buffer.getvalue()