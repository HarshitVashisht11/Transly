import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Upload,
  Headphones,
  FileText,
  Globe,
  Zap,
  FolderOpen,
  Edit,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Convert Audio to Text{" "}
                <span className="text-transly-800">in Seconds.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                AI-powered transcription with high accuracy and real-time
                processing. Upload any audio file and get precise text
                instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="btn-gradient text-white font-medium px-6 py-6"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Audio & Transcribe
                  </Button>
                </Link>
                <Link to="/features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-medium px-6 py-6"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-transly-600 to-transly-800 opacity-30 blur"></div>
                <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-12 w-12 bg-transly-100 rounded-full flex items-center justify-center">
                          <Headphones className="h-6 w-6 text-transly-800" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            interview_audio.mp3
                          </div>
                          <div className="text-xs text-gray-500">
                            Processing...
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div className="h-2 bg-transly-600 rounded-full w-2/3"></div>
                      </div>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                        "Thank you for joining us today. Could you tell us a bit
                        about your background and experience with..."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Transcription Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to convert audio to text efficiently and
              accurately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <div className="h-12 w-12 bg-transly-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-transly-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Languages</h3>
              <p className="text-gray-600">
                Support for over 50 languages with high accuracy transcription.
              </p>
            </div>

            <div className="feature-card">
              <div className="h-12 w-12 bg-transly-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-transly-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Accurate</h3>
              <p className="text-gray-600">
                High-speed processing with industry-leading accuracy rates.
              </p>
            </div>

            <div className="feature-card">
              <div className="h-12 w-12 bg-transly-100 rounded-lg flex items-center justify-center mb-4">
                <FolderOpen className="h-6 w-6 text-transly-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload & Convert</h3>
              <p className="text-gray-600">
                Support for audio and video files in various formats.
              </p>
            </div>

            <div className="feature-card">
              <div className="h-12 w-12 bg-transly-100 rounded-lg flex items-center justify-center mb-4">
                <Edit className="h-6 w-6 text-transly-800" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Edit & Export</h3>
              <p className="text-gray-600">
                Edit transcripts and export in multiple formats including TXT
                and DOCX.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get your audio transcribed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-transly-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-transly-800">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your File</h3>
              <p className="text-gray-600">
                Drag and drop or select your audio/video file to upload.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-transly-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-transly-800">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Options</h3>
              <p className="text-gray-600">
                Select language and start the transcription process.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-transly-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-transly-800">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Get Your Transcript
              </h3>
              <p className="text-gray-600">
                Download or edit your transcript in various formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Convert Your Audio to Text?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Transly for their
            transcription needs.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="btn-gradient text-white font-medium px-8 py-6"
            >
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
