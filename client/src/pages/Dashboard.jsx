import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { users, transcription } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Mic, FileText, Download, Edit, X, FileAudio, Trash2, Settings, LogOut, User } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [model, setModel] = useState("base");
  const [processing, setProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [jobPolling, setJobPolling] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileAndHistory = async () => {
      try {
        const userData = await users.getProfile();
        setProfile(userData);

        const jobs = await transcription.getJobs();
        setHistory(jobs);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your data",
          variant: "destructive",
        });
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndHistory();

    return () => {
      if (jobPolling) clearInterval(jobPolling);
    };
  }, [toast]);

  useEffect(() => {
    if (!currentJobId) return;

    if (jobPolling) clearInterval(jobPolling);

    const pollJob = async () => {
      try {
        const job = await transcription.getJob(currentJobId);

        if (job.status === "COMPLETED") {
          setProgress(100);
          setProcessing(false);
          setTranscript(job.transcript || "");
          setCurrentJobId(null);

          const updatedJobs = await transcription.getJobs();
          setHistory(updatedJobs);

          toast({
            title: "Transcription complete",
            description: `Your file has been successfully transcribed`,
          });

          if (jobPolling) clearInterval(jobPolling);
          setJobPolling(null);
        } else if (job.status === "FAILED") {
          setProcessing(false);
          setCurrentJobId(null);

          toast({
            title: "Transcription failed",
            description: "There was a problem processing your file",
            variant: "destructive",
          });

          if (jobPolling) clearInterval(jobPolling);
          setJobPolling(null);
        } else if (job.status === "PROCESSING") {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }
      } catch (error) {
        console.error("Error polling job:", error);
      }
    };

    const interval = setInterval(pollJob, 3000);
    setJobPolling(interval);

    return () => clearInterval(interval);
  }, [currentJobId, toast]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(
      (file) => file.type.includes("audio") || file.type.includes("video")
    );

    if (newFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload audio or video files only",
        variant: "destructive",
      });
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((files) => files.filter((_, i) => i !== index));
  };

  const startTranscription = async () => {
    if (files.length === 0) {
      toast({
        title: "No files",
        description: "Please upload at least one file to transcribe",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("model", model);
      formData.append("language", language);
      formData.append("translate", "false");

      const response = await transcription.createJob(formData);

      setCurrentJobId(response.id);

      toast({
        title: "Transcription started",
        description: "Your file is being processed",
      });
    } catch (error) {
      setProcessing(false);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to start transcription",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      await transcription.deleteJob(id);

      setHistory(history.filter((job) => job.id !== id));

      toast({
        title: "Job deleted",
        description: "The transcription job has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the transcription job",
        variant: "destructive",
      });
    }
  };

  const handleViewJob = async (id) => {
    try {
      const job = await transcription.getJob(id);
      setTranscript(job.transcript || "");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load the transcript",
        variant: "destructive",
      });
    }
  };

  const handleExport = (format) => {
    if (!transcript) {
      toast({
        title: "No transcript",
        description: "There is no transcript to export",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your transcript will be downloaded shortly",
    });

    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcript.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const modelInfo = {
    tiny: {
      description: "Optimized for speed with good accuracy (smallest model)",
      processingTime: "Fast",
      accuracy: "Good",
    },
    base: {
      description: "Balanced performance for most transcription needs (medium model)",
      processingTime: "Medium",
      accuracy: "Very Good",
    },
    small: {
      description: "Good accuracy with reasonable speed",
      processingTime: "Medium",
      accuracy: "Very Good",
    },
    medium: {
      description: "High accuracy with moderate processing time",
      processingTime: "Slow",
      accuracy: "Excellent",
    },
    large: {
      description: "Highest accuracy for professional transcriptions (largest model)",
      processingTime: "Very Slow",
      accuracy: "Excellent",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transly-800">Transly</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-600 hover:text-gray-900 flex items-center focus:outline-none">
                    <div className="h-8 w-8 rounded-full bg-transly-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-transly-800">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem disabled className="flex flex-col items-start">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Upload Audio</h2>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging ? "border-transly-500 bg-transly-50" : "border-gray-300 hover:border-transly-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="audio/*,video/*"
                multiple
              />
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">
                  Drop your audio or video here
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse your files</p>
                <p className="text-xs text-gray-400 mt-3">Supports MP3, WAV, MP4, and more</p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({files.length})
                </h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-md p-3"
                    >
                      <div className="flex items-center">
                        <FileAudio className="h-5 w-5 text-transly-600 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Language</p>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Transcription Model</p>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiny">Fast (Whisper Tiny)</SelectItem>
                    <SelectItem value="base">Standard (Whisper Base)</SelectItem>
                    <SelectItem value="medium">Professional (Whisper Medium)</SelectItem>
                    <SelectItem value="large">Enterprise (Whisper Large)</SelectItem>
                  </SelectContent>
                </Select>
                {modelInfo[model] && (
                  <p className="text-xs text-gray-500 mt-1">{modelInfo[model].description}</p>
                )}
                {modelInfo[model] && (
                  <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Speed:</span>
                      {modelInfo[model].processingTime}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Accuracy:</span>
                      {modelInfo[model].accuracy}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button
                className="btn-gradient text-white w-full md:w-auto"
                disabled={files.length === 0 || processing}
                onClick={startTranscription}
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Transcription
              </Button>
            </div>
          </div>

          {processing && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Transcribing...</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProcessing(false);
                    if (jobPolling) clearInterval(jobPolling);
                    setJobPolling(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-transly-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-500">
                  <p>Transcribing {files[0]?.name || "file"}</p>
                  <p className="flex items-center">
                    <Settings className="h-3 w-3 mr-1" />
                    Using <span className="font-medium mx-1">{model}</span> model
                  </p>
                </div>
              </div>
            </div>
          )}

          {transcript && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Transcript</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                  <Select onValueChange={handleExport}>
                    <SelectTrigger className="w-[110px] h-9">
                      <SelectValue placeholder="Export" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="txt">TXT</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="srt">SRT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-transly-500"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                ></textarea>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-gray-700 min-h-[200px]">
                  {transcript}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <Tabs defaultValue="history">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Transcriptions</h2>
                <TabsList>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="history">
                {history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            File Name
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((job) => (
                          <tr key={job.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <FileAudio className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">
                                  {job.audioFileKey?.split("-").slice(1).join("-") || "Unnamed"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : job.status === "FAILED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {job.status.toLowerCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {job.status === "COMPLETED" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewJob(job.id)}
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleViewJob(job.id).then(() => handleExport("txt"))
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                      <span className="sr-only">Download</span>
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteJob(job.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No transcription history yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved">
                <div className="text-center py-12">
                  <p className="text-gray-500">No saved transcriptions</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}