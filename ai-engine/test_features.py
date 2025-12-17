"""
Test script for professional plagiarism and AI detection features
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_plagiarism_checker():
    print("\n" + "="*60)
    print("TESTING PLAGIARISM CHECKER")
    print("="*60)
    
    # Test 1: Known plagiarized text (Wikipedia excerpt)
    plagiarized_text = """
    Artificial intelligence is intelligence demonstrated by machines, 
    in contrast to the natural intelligence displayed by humans and animals. 
    Leading AI textbooks define the field as the study of intelligent agents.
    """
    
    print("\n📝 Test 1: Known plagiarized text (Wikipedia excerpt)")
    response = requests.post(f"{BASE_URL}/check-plagiarism", 
                            json={"text": plagiarized_text})
    result = response.json()
    print(f"   Score: {result['score']}%")
    print(f"   Flagged: {len(result.get('flaggedSentences', []))} sentences")
    if result.get('flaggedSentences'):
        for match in result['flaggedSentences'][:2]:
            print(f"   - Match: {match.get('similarity')}% similar to {match.get('source')}")
    
    # Test 2: Original text
    original_text = """
    I personally believe that machine learning has revolutionized how we 
    approach data analysis in my field. From my experience working on 
    healthcare projects, I've seen firsthand how these algorithms can 
    identify patterns that would take humans months to discover.
    """
    
    print("\n📝 Test 2: Original human-written text")
    response = requests.post(f"{BASE_URL}/check-plagiarism", 
                            json={"text": original_text})
    result = response.json()
    print(f"   Score: {result['score']}%")
    print(f"   Flagged: {len(result.get('flaggedSentences', []))} sentences")

def test_ai_detector():
    print("\n" + "="*60)
    print("TESTING AI CONTENT DETECTOR")
    print("="*60)
    
    # Test 1: AI-generated text (typical ChatGPT style)
    ai_text = """
    Machine learning represents a significant advancement in artificial intelligence. 
    Furthermore, it enables systems to learn from data patterns. Moreover, these 
    algorithms can process vast amounts of information efficiently. Additionally, 
    the applications span across various industries. Therefore, understanding 
    machine learning is crucial for modern technology development.
    """
    
    print("\n🤖 Test 1: AI-generated text")
    response = requests.post(f"{BASE_URL}/detect-ai-content", 
                            json={"text": ai_text})
    result = response.json()
    print(f"   AI Score: {result['score']}%")
    print(f"   Confidence: {result.get('confidence', 'N/A')}%")
    analysis = result.get('analysis', {})
    if analysis.get('reasons'):
        print(f"   Reasons:")
        for reason in analysis['reasons'][:3]:
            print(f"   - {reason}")
    if analysis.get('metrics'):
        print(f"   Metrics: {analysis['metrics']}")
    
    # Test 2: Human-written text (informal, with errors)
    human_text = """
    So I've been working on this ML project and honestly it's been kinda tough. 
    Like, the data preprocessing alone took me forever - way longer than I thought. 
    My colleague Sarah suggested trying a different approach but I'm not sure if 
    that'll work. Anyway, I'll probably give it a shot tomorrow and see what happens.
    """
    
    print("\n👤 Test 2: Human-written text")
    response = requests.post(f"{BASE_URL}/detect-ai-content", 
                            json={"text": human_text})
    result = response.json()
    print(f"   AI Score: {result['score']}%")
    print(f"   Confidence: {result.get('confidence', 'N/A')}%")
    analysis = result.get('analysis', {})
    if analysis.get('reasons'):
        print(f"   Reasons:")
        for reason in analysis['reasons'][:3]:
            print(f"   - {reason}")

if __name__ == "__main__":
    try:
        print("\n🚀 Starting Professional AI/Plagiarism Feature Tests")
        print(f"   Backend: {BASE_URL}")
        
        test_plagiarism_checker()
        test_ai_detector()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to AI engine at", BASE_URL)
        print("   Make sure the AI engine is running (python main.py)")
    except Exception as e:
        print(f"\n❌ Error: {e}")
