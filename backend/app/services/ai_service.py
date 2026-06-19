def generate_explanation(title, legal_basis, rights_summary, authority):
    return f"""
You are facing: {title}

Here’s what this means in simple terms:

{rights_summary}

Legal basis:
{legal_basis}

What you should do next:
- Stay calm
- Contact a lawyer if possible
- Approach the relevant authority: {authority}
- Keep records or evidence

Disclaimer: This is general legal information and not professional legal advice.
"""