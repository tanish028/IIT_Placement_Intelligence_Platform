from database import get_connection

# ── Home Dashboard ───────────────────────────────────────────────

def get_summary():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(DISTINCT "Institute")           AS total_institutes,
            MIN("Year")                           AS min_year,
            MAX("Year")                           AS max_year,
            ROUND(AVG("AvgPackage_LPA")::numeric, 2)       AS avg_package_lpa,
            ROUND(AVG("Placement_Percentage")::numeric, 2) AS avg_placement_pct
        FROM placements
    """)
    row = dict(cursor.fetchone())
    conn.close()

    return {
        "total_institutes": row["total_institutes"],
        "years_covered": f"{row['min_year']} – {row['max_year']}",
        "avg_package_lpa": float(row["avg_package_lpa"]) if row["avg_package_lpa"] else None,
        "avg_placement_pct": float(row["avg_placement_pct"]) if row["avg_placement_pct"] else None,
    }

# ── IIT Comparison ───────────────────────────────────────────────

def get_comparison(institutes: list, year: int):
    conn = get_connection()
    cursor = conn.cursor()

    placeholders = ", ".join(["%s"] * len(institutes))
    query = f"""
        SELECT
            "Institute"                                         AS institute,
            "Program"                                           AS program,
            "Year"                                              AS year,
            ROUND(AVG("AvgPackage_LPA")::numeric, 2)           AS avg_package_lpa,
            ROUND(AVG("MedianPackage_LPA")::numeric, 2)        AS median_package_lpa,
            MAX("Highest_Domestic_LPA")                        AS highest_domestic_lpa,
            MAX("Highest_International_LPA")                   AS highest_international_lpa,
            ROUND(AVG("Placement_Percentage")::numeric, 2)     AS placement_percentage
        FROM placements
        WHERE "Institute" IN ({placeholders})
          AND "Year" = %s
        GROUP BY "Institute", "Program", "Year"
        ORDER BY "Institute"
    """
    cursor.execute(query, institutes + [year])
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Branch Analytics ─────────────────────────────────────────────

def get_branch_stats(institute: str, year: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            "Institute"                 AS institute,
            "Program"                   AS program,
            "Year"                      AS year,
            "Branch"                    AS branch,
            "AvgPackage_LPA"            AS avg_package_lpa,
            "MedianPackage_LPA"         AS median_package_lpa,
            "Highest_Domestic_LPA"      AS highest_domestic_lpa,
            "Highest_International_LPA" AS highest_international_lpa,
            "Placement_Percentage"      AS placement_percentage
        FROM placements
        WHERE "Institute" = %s
          AND "Year" = %s
        ORDER BY "AvgPackage_LPA" DESC NULLS LAST
    """, (institute, year))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Sector Analytics ─────────────────────────────────────────────

def get_sector_stats(institute: str, year: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            "Institute"          AS institute,
            "program"            AS program,
            "Year"               AS year,
            "Branch"             AS branch,
            "Sector"             AS sector,
            "Students_Placed"    AS students_placed,
            "Placement_Percentage" AS placement_percentage
        FROM branch_sector
        WHERE "Institute" = %s
          AND "Year" = %s
        ORDER BY "Students_Placed" DESC
    """, (institute, year))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Trend Analysis ───────────────────────────────────────────────

def get_trends(institute: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            "Year"                                              AS year,
            ROUND(AVG("AvgPackage_LPA")::numeric, 2)           AS avg_package_lpa,
            ROUND(AVG("Placement_Percentage")::numeric, 2)     AS placement_percentage
        FROM placements
        WHERE "Institute" = %s
        GROUP BY "Year"
        ORDER BY "Year" ASC
    """, (institute,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Best IITs for a Branch ───────────────────────────────────────

def get_best_iits_for_branch(branch: str, year: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            "Institute"                                         AS institute,
            "Branch"                                            AS branch,
            "Year"                                              AS year,
            ROUND(AVG("AvgPackage_LPA")::numeric, 2)           AS avg_package_lpa,
            ROUND(AVG("Placement_Percentage")::numeric, 2)     AS placement_percentage
        FROM placements
        WHERE "Branch" = %s
          AND "Year" = %s
        GROUP BY "Institute", "Branch", "Year"
        ORDER BY avg_package_lpa DESC NULLS LAST
    """, (branch, year))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Year-on-Year Growth Rate ──────────────────────────────────────

def get_growth_rates(year_from: int, year_to: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a."Institute"                                           AS institute,
            ROUND(a.avg_pkg::numeric, 2)                           AS avg_package_from,
            ROUND(b.avg_pkg::numeric, 2)                           AS avg_package_to,
            ROUND(((b.avg_pkg - a.avg_pkg) / a.avg_pkg * 100)::numeric, 2) AS growth_pct
        FROM (
            SELECT "Institute", AVG("AvgPackage_LPA") AS avg_pkg
            FROM placements
            WHERE "Year" = %s
            GROUP BY "Institute"
        ) a
        INNER JOIN (
            SELECT "Institute", AVG("AvgPackage_LPA") AS avg_pkg
            FROM placements
            WHERE "Year" = %s
            GROUP BY "Institute"
        ) b ON a."Institute" = b."Institute"
        ORDER BY growth_pct DESC
    """, (year_from, year_to))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Filter Options ───────────────────────────────────────────────

def get_filter_options():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT "Institute" FROM placements ORDER BY "Institute"')
    institutes = [r["Institute"] for r in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT "Branch" FROM placements ORDER BY "Branch"')
    branches = [r["Branch"] for r in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT "Program" FROM placements ORDER BY "Program"')
    programs = [r["Program"] for r in cursor.fetchall()]

    cursor.execute('SELECT DISTINCT "Year" FROM placements ORDER BY "Year"')
    years = [r["Year"] for r in cursor.fetchall()]

    conn.close()
    return {
        "institutes": institutes,
        "branches": branches,
        "programs": programs,
        "years": years,
    }
